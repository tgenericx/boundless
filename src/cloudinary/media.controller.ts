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
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiExtraModels,
  ApiOkResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from 'src/utils/guards';
import { CloudinaryService } from './cloudinary.service';
import {
  CloudinaryUploadFailureDto,
  CloudinaryUploadResult,
  CloudinaryUploadSuccessDto,
} from './response.types';

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
  @ApiExtraModels(CloudinaryUploadSuccessDto, CloudinaryUploadFailureDto)
  @ApiOkResponse({
    description: 'Files uploaded (success or failure per file)',
    schema: {
      type: 'array',
      items: {
        oneOf: [
          { $ref: getSchemaPath(CloudinaryUploadSuccessDto) },
          { $ref: getSchemaPath(CloudinaryUploadFailureDto) },
        ],
      },
    },
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
  ): Promise<CloudinaryUploadResult[]> {
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

    return Promise.all(
      files.map((file) => this.cloudinaryService.uploadFile(file)),
    );
  }
}
