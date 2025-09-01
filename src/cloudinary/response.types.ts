import { ApiProperty } from '@nestjs/swagger';
import { UploadApiOptions, type UploadApiResponse } from 'cloudinary';

export class FileUploadSuccessful {
  @ApiProperty({ example: true })
  success: true;

  @ApiProperty({ example: 'image.png' })
  filename: string;

  @ApiProperty({
    description: 'Cloudinary success response object',
    type: Object,
  })
  data: UploadApiResponse;
}

export class FileUploadFailed {
  @ApiProperty({ example: false })
  success: false;

  @ApiProperty({ example: 'image.png' })
  filename: string;

  @ApiProperty({
    description: 'Cloudinary error response',
    type: String,
  })
  error: string;
}

export type FileUploadResult = FileUploadSuccessful | FileUploadFailed;

export interface ExtendedUploadOptions extends UploadApiOptions {
  file: Express.Multer.File;
  timeoutMs?: number;
}

export class CloudinaryUploadError extends Error {
  constructor(
    message: string,
    public readonly http_code: number,
    public readonly cloudinaryName: string,
  ) {
    super(message);
    this.name = 'CloudinaryUploadError';
  }
}
