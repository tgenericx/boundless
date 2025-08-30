import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  UploadApiErrorResponse,
  UploadApiResponse,
  v2 as Cloudinary,
} from 'cloudinary';
import { CLOUDINARY } from './cloudinary.provider';
import { Readable } from 'stream';
import { CloudinaryUploadResult } from './response.types';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(
    @Inject(CLOUDINARY) private readonly cloudinary: typeof Cloudinary,
  ) {}

  async uploadFile(file: Express.Multer.File): Promise<CloudinaryUploadResult> {
    return new Promise((resolve) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'uploads',
          public_id: file.originalname.split('.')[0],
        },
        (error: UploadApiErrorResponse, result: UploadApiResponse) => {
          if (error) {
            this.logger.error(
              `❌ Upload failed for ${file.originalname}: ${error.message}`,
            );
            return resolve({
              success: false,
              filename: file.originalname,
              error,
            });
          }

          this.logger.log(
            `✅ Uploaded ${file.originalname} → ${result.secure_url}`,
          );
          return resolve({
            success: true,
            filename: file.originalname,
            data: result,
          });
        },
      );

      Readable.from(file.buffer).pipe(uploadStream);
    });
  }

  async deleteFile(publicId: string): Promise<void> {
    try {
      await this.cloudinary.uploader.destroy(publicId);
    } catch (error) {
      this.logger.error(
        `❌ Failed to delete file from Cloudinary: ${publicId}`,
        error,
      );
      throw error;
    }
  }
}
