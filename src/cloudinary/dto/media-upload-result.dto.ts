import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MediaUploadResultDto {
  @ApiProperty({ description: 'Original filename of the uploaded media' })
  filename: string;

  @ApiProperty({ description: 'Indicates whether the upload was successful' })
  success: boolean;

  @ApiPropertyOptional({ description: 'Secure URL to the uploaded media' })
  url?: string;

  @ApiPropertyOptional({ description: 'Cloudinary public ID of the file' })
  public_id?: string;

  @ApiPropertyOptional({ description: 'Error message if upload failed' })
  error?: string;

  @ApiPropertyOptional({ description: 'File format (e.g., jpg, png)' })
  format?: string;

  @ApiPropertyOptional({ description: 'Media width in pixels' })
  width?: number;

  @ApiPropertyOptional({ description: 'Media height in pixels' })
  height?: number;

  @ApiPropertyOptional({ description: 'File size in bytes' })
  bytes?: number;
}
