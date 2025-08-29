import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  UploadApiResponse,
  UploadApiErrorResponse,
  v2 as CloudinaryType,
} from 'cloudinary';
import { Readable } from 'stream';
import { CLOUDINARY } from './cloudinary.provider';

export interface CloudinaryUploadResult {
  success: boolean;
  data?: UploadApiResponse;
  error?: UploadApiErrorResponse | Error | { message: string; error: unknown };
}

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(
    @Inject(CLOUDINARY) private readonly cloudinary: typeof CloudinaryType,
  ) {}

  async uploadFile(file: Express.Multer.File): Promise<CloudinaryUploadResult> {
    return new Promise((resolve) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'posts',
          eager: [{ format: 'jpg', quality: 'auto' }],
          eager_async: true,
          transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        },
        (error, result) => {
          if (error || !result) {
            this.logger.error('Cloudinary upload failed', error);
            return resolve({ success: false, error });
          }

          this.logger.log(`File uploaded to Cloudinary: ${result.secure_url}`);
          resolve({ success: true, data: result });
        },
      );

      const stream = Readable.from(file.buffer);

      stream.on('error', (error) => {
        this.logger.error('Stream error during upload', error);
        resolve({ success: false, error: { message: 'Stream error', error } });
      });

      uploadStream.on('error', (error) => {
        this.logger.error('Upload stream error', error);
        resolve({ success: false, error });
      });

      stream.pipe(uploadStream);
    });
  }

  async deleteFile(publicId: string): Promise<void> {
    try {
      await this.cloudinary.uploader.destroy(publicId);
      this.logger.log(`File deleted from Cloudinary: ${publicId}`);
    } catch (error) {
      this.logger.error(
        `Failed to delete file from Cloudinary: ${publicId}`,
        error,
      );
      throw error;
    }
  }
}
