import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiResponse,
  ApiTags,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  CloudinaryService,
  CloudinaryUploadResult,
} from '../cloudinary/cloudinary.service';
import { ParseFilePipeBuilder, MaxFileSizeValidator } from '@nestjs/common';
import { MediaUploadResultDto } from './dto/media-upload-result.dto';

const SUPPORTED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

@ApiTags('Media Uploads')
@ApiExtraModels(MediaUploadResultDto)
@Controller('media')
export class MediaController {
  constructor(private readonly cloudinaryService: CloudinaryService) { }
  public readonly logger = new Logger(CloudinaryService.name);

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 10))
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
    description: 'Files uploaded with per-file success/failure',
    schema: {
      type: 'object',
      properties: {
        results: {
          type: 'array',
          items: { $ref: getSchemaPath(MediaUploadResultDto) },
        },
      },
    },
  })
  async uploadFiles(
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addValidator(new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE }))
        .build({ fileIsRequired: true }),
    )
    files: Express.Multer.File[],
  ): Promise<{ results: MediaUploadResultDto[] }> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const results = await Promise.allSettled(
      files.map(async (file): Promise<MediaUploadResultDto> => {
        const isSupported = SUPPORTED_MIME_TYPES.includes(file.mimetype);
        if (!isSupported) {
          throw new BadRequestException(
            `Unsupported file type: ${file.mimetype}`,
          );
        }

        const upload: CloudinaryUploadResult =
          await this.cloudinaryService.uploadFile(file);

        if (upload.success && upload.data) {
          return {
            filename: file.originalname,
            success: true,
            public_id: upload.data.public_id,
            url: upload.data.secure_url,
            format: upload.data.format,
            width: upload.data.width,
            height: upload.data.height,
            bytes: upload.data.bytes,
          };
        } else {
          this.logger.error(
            `Upload failed for file "${file.originalname}"`,
            upload.error,
          );

          return {
            filename: file.originalname,
            success: false,
            error:
              upload.error?.message ||
              `Unknown Cloudinary error for file: ${file.originalname}`,
          };
        }
      }),
    );

    const typedResults: MediaUploadResultDto[] = results.map((res, i) => {
      if (res.status === 'fulfilled') {
        return res.value;
      } else {
        return {
          filename: files[i]?.originalname || `file-${i}`,
          success: false,
          error:
            res.reason instanceof Error
              ? res.reason.message
              : `Unhandled error uploading ${files[i]?.originalname || `file-${i}`}`,
        };
      }
    });

    return { results: typedResults };
  }
}
