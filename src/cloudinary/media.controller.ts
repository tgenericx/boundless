import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CloudinaryService,
  CloudinaryUploadResult,
} from '../cloudinary/cloudinary.service';
import { ParseFilePipeBuilder, MaxFileSizeValidator } from '@nestjs/common';

export interface MediaUploadResult {
  filename: string;
  success: boolean;
  url?: string;
  public_id?: string;
  error?: string;
}

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
@Controller('media')
export class MediaController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

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
    type: Object, // could add @ApiExtraModels if using class-based DTOs
  })
  async uploadFiles(
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addValidator(new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE }))
        .build({ fileIsRequired: true }),
    )
    files: Express.Multer.File[],
  ): Promise<{ results: MediaUploadResult[] }> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const results = await Promise.allSettled(
      files.map(async (file): Promise<MediaUploadResult> => {
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
            url: upload.data.secure_url,
            public_id: upload.data.public_id,
          };
        } else {
          return {
            filename: file.originalname,
            success: false,
            error: upload.error?.message || 'Unknown Cloudinary error',
          };
        }
      }),
    );

    const typedResults: MediaUploadResult[] = results.map((res, i) =>
      res.status === 'fulfilled'
        ? res.value
        : {
            filename: files[i]?.originalname || `file-${i}`,
            success: false,
            error: res.reason?.message || 'Unhandled upload error',
          },
    );

    return { results: typedResults };
  }
}
