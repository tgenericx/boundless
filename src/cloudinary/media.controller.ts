import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  Logger,
  Inject,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ParseFilePipeBuilder, MaxFileSizeValidator } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { CloudinaryUploadMapped } from './response.types';
import { ApiBody, ApiConsumes, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

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

    const results = await Promise.allSettled(
      files.map(async (file): Promise<CloudinaryUploadMapped> => {
        const isSupported = this.SUPPORTED_MIME_TYPES.includes(file.mimetype);
        if (!isSupported) {
          return {
            success: false,
            filename: file.originalname,
            error: `Unsupported file type: ${file.mimetype}`,
          };
        }

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
              upload.error?.message ||
              `Unknown Cloudinary error for file: ${file.originalname}`,
          };
        }
      }),
    );

    const typedResults: CloudinaryUploadMapped[] = results.map((res, i) => {
      if (res.status === 'fulfilled') {
        return res.value;
      } else {
        return {
          success: false,
          filename: files[i]?.originalname || `file-${i}`,
          error:
            res.reason instanceof Error
              ? res.reason.message
              : `Unhandled error uploading ${files[i]?.originalname || `file-${i}`}`,
        };
      }
    });

    return typedResults;
  }
}
