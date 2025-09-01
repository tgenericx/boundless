import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  Logger,
  Inject,
  UseGuards,
  HttpException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ParseFilePipeBuilder, MaxFileSizeValidator } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from 'src/utils/guards';
import { CloudinaryService } from './cloudinary.service';
import { UploadApiResponse } from 'cloudinary';
import { CloudinaryUploadError, ExtendedUploadOptions } from './response.types';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_FILES = 10;
const DEFAULT_SUPPORTED_TYPES = [
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
      DEFAULT_SUPPORTED_TYPES,
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
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'All files uploaded successfully',
    type: Object,
    isArray: true,
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
  ): Promise<UploadApiResponse[]> {
    if (!files?.length) {
      throw new BadRequestException('No files uploaded');
    }

    const invalidFiles = files.filter(
      (file) => !this.SUPPORTED_MIME_TYPES.includes(file.mimetype),
    );

    if (invalidFiles.length) {
      throw new BadRequestException(
        `Unsupported file types: ${invalidFiles
          .map((f) => f.mimetype)
          .join(', ')}`,
      );
    }

    try {
      const timeoutMs = this.configService.get<number>(
        'media.uploadTimeoutMs',
        30000,
      );

      return await Promise.all(
        files.map((file) => {
          const options: ExtendedUploadOptions = {
            file,
            folder: 'uploads',
            timeoutMs,
          };
          return this.cloudinaryService.uploadFile(options);
        }),
      );
    } catch (e) {
      if (e instanceof CloudinaryUploadError) {
        this.logger.error(`❌ Upload failed: ${e.message}`);
        throw new HttpException(e.message, e.http_code);
      }
      throw e;
    }
  }
}
