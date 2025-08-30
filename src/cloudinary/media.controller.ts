import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  Logger,
  Inject,
  UseGuards,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ParseFilePipeBuilder, MaxFileSizeValidator } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { CloudinaryUploadMapped } from './response.types';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from 'src/utils/guards';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_FILES = 10;
const supportedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
];

@ApiTags('Media Uploads')
@Controller('media')
export class MediaController {
  private readonly logger = new Logger(MediaController.name);
  private readonly SUPPORTED_MIME_TYPES: string[];

  constructor(
    private readonly cloudinaryService: CloudinaryService,
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {
    this.SUPPORTED_MIME_TYPES = this.configService.get<string[]>(
      'media.supportedMimeTypes',
      supportedMimeTypes,
    );
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload up to 10 media files (images/videos)',
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Files uploaded successfully',
    type: Object,
  })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', MAX_FILES))
  async uploadFiles(
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addValidator(new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE }))
        .build({
          fileIsRequired: true,
          exceptionFactory: (err) => {
            throw new BadRequestException(err);
          },
        }),
    )
    files: Express.Multer.File[],
  ): Promise<CloudinaryUploadMapped[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const invalidFiles = files.filter(
      (file) => !this.SUPPORTED_MIME_TYPES.includes(file.mimetype),
    );

    if (invalidFiles.length > 0) {
      throw new BadRequestException(
        `Unsupported file types: ${invalidFiles.map((f) => f.mimetype).join(', ')}`,
      );
    }
    const results = await Promise.allSettled(
      files.map(async (file): Promise<CloudinaryUploadMapped> => {
        const upload = await this.cloudinaryService.uploadFile(file);
        this.logger.log(upload);

        if (upload.success && upload.data) {
          const { data } = upload;
          return {
            success: true,
            filename: file.originalname,
            public_id: data.public_id,
            secure_url: data.secure_url,
            format: data.format,
            width: data.width,
            height: data.height,
            bytes: data.bytes,
            resource_type: data.resource_type,
            duration: data.duration,
            playback_url: data.playback_url,
            eager: data.eager,
          };
        } else {
          this.logger.error(
            `Upload failed for file "${file.originalname}"`,
            upload.error,
          );

          return {
            success: false,
            filename: file.originalname,
            error:
              upload.error instanceof Error
                ? upload.error.message
                : JSON.stringify(upload.error),
          };
        }
      }),
    );

    const typedResults: CloudinaryUploadMapped[] = results.map((res, i) => {
      if (res.status === 'fulfilled') {
        return res.value;
      }

      const filename = files[i]?.originalname || `file-${i}`;
      const errorMessage =
        res.reason instanceof Error
          ? res.reason.message
          : 'Upload processing failed';

      this.logger.error(`Upload failed for ${filename}`, res.reason);

      return {
        success: false,
        filename,
        error: `Failed to process ${filename}: ${errorMessage}`,
      };
    });

    return typedResults;
  }
}
