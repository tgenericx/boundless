import { ApiProperty } from '@nestjs/swagger';
import type { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';

export class CloudinaryUploadSuccessDto {
  @ApiProperty({ example: true })
  success: true;

  @ApiProperty({ example: 'image.png' })
  filename: string;

  @ApiProperty({
    description: 'Cloudinary response object',
    type: Object,
  })
  data: UploadApiResponse;
}

export class CloudinaryUploadFailureDto {
  @ApiProperty({ example: false })
  success: false;

  @ApiProperty({ example: 'image.png' })
  filename: string;

  @ApiProperty({
    description: 'Cloudinary error response object',
    type: Object,
  })
  error: UploadApiErrorResponse;
}

export type CloudinaryUploadResult =
  | CloudinaryUploadSuccessDto
  | CloudinaryUploadFailureDto;
