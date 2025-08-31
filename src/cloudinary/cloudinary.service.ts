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

  private generatePublicId(originalName: string): string {
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
    const safeBase = nameWithoutExt.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 100);
    const timestamp = Date.now();
    const random = Math.random().toString(36).slice(2, 8);
    return `${safeBase}_${timestamp}_${random}`;
  }

  async uploadFile(file: Express.Multer.File): Promise<CloudinaryUploadResult> {
    return new Promise((resolve) => {
      let settled = false;

      const safeResolve = (value: CloudinaryUploadResult) => {
        if (!settled) {
          settled = true;
          resolve(value);
        }
      };

      const uploadStream = this.cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'uploads',
          public_id: this.generatePublicId(file.originalname),
        },
        (error: UploadApiErrorResponse, result: UploadApiResponse) => {
          if (error) {
            this.logger.error(
              `❌ Upload failed for ${file.originalname}: ${error.message}`,
            );
            return safeResolve({
              success: false,
              filename: file.originalname,
              error,
            });
          }

          this.logger.log(
            `✅ Uploaded ${file.originalname} → ${result.secure_url}`,
          );
          return safeResolve({
            success: true,
            filename: file.originalname,
            data: result,
          });
        },
      );

      uploadStream.on('error', (error) => {
        this.logger.error(`❌ Stream error during upload: ${error.message}`);
        safeResolve({
          success: false,
          filename: file.originalname,
          error,
        });
      });

      Readable.from(file.buffer)
        .on('error', (error) => {
          this.logger.error(`❌ File stream error: ${error.message}`);
          safeResolve({
            success: false,
            filename: file.originalname,
            error,
          });
        })
        .pipe(uploadStream);
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
