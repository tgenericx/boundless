import { Expose, Exclude, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Exclude()
export class EagerTransformationDto {
  @ApiProperty() @Expose() transformation: string;
  @ApiProperty() @Expose() width: number;
  @ApiProperty() @Expose() height: number;
  @ApiProperty() @Expose() bytes: number;
  @ApiProperty() @Expose() format: string;
  @ApiProperty() @Expose() secure_url: string;
}

@Exclude()
export class MediaUploadResultDto {
  @ApiProperty() @Expose() filename: string;
  @ApiProperty() @Expose() success: boolean;
  @ApiProperty() @Expose() public_id: string;
  @ApiProperty() @Expose() secure_url: string;
  @ApiProperty() @Expose() resource_type: string;
  @ApiPropertyOptional() @Expose() format?: string;
  @ApiPropertyOptional() @Expose() width?: number;
  @ApiPropertyOptional() @Expose() height?: number;
  @ApiPropertyOptional() @Expose() bytes?: number;
  @ApiPropertyOptional() @Expose() created_at?: string;
  @ApiPropertyOptional() @Expose() original_filename?: string;
  @ApiPropertyOptional() @Expose() url?: string;
  @ApiPropertyOptional() @Expose() type?: string;
  @ApiPropertyOptional() @Expose() etag?: string;

  @ApiPropertyOptional({ type: [EagerTransformationDto] })
  @Expose()
  @Type(() => EagerTransformationDto)
  eager?: EagerTransformationDto[];

  @ApiPropertyOptional() @Expose() error?: string;
}
