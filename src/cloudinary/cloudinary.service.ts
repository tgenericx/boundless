import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  UploadApiErrorResponse,
  UploadApiResponse,
  v2 as Cloudinary,
} from 'cloudinary';
import { CLOUDINARY } from './cloudinary.provider';
import { Readable } from 'stream';
import { CloudinaryUploadError, ExtendedUploadOptions } from './response.types';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(
    @Inject(CLOUDINARY) private readonly cloudinary: typeof Cloudinary,
  ) {}

  private generatePublicId(originalName: string): string {
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
    const safeBase = nameWithoutExt
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 100);
    const timestamp = Date.now();
    const random = Math.random().toString(36).slice(2, 8);
    return `${safeBase}_${timestamp}_${random}`;
  }

  async uploadFile(options: ExtendedUploadOptions): Promise<UploadApiResponse> {
    const { file, timeoutMs, ...cloudinaryUploadOptions } = options;

    return new Promise((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          public_id: this.generatePublicId(file.originalname),
          ...cloudinaryUploadOptions,
        },
        (error: UploadApiErrorResponse, result: UploadApiResponse) => {
          if (error) {
            const err = new CloudinaryUploadError(
              error.message,
              error.http_code,
              error.name,
            );
            this.logger.error(
              `❌ Upload failed for ${file.originalname}: ${err.message} (http_code=${err.http_code})`,
            );
            return reject(err);
          }

          if (!result) {
            return reject(new Error('Cloudinary returned no result.'));
          }

          this.logger.log(
            `✅ Uploaded ${file.originalname} → ${result.secure_url} (public_id=${result.public_id})`,
          );
          return resolve(result);
        },
      );

      let timeout: NodeJS.Timeout | undefined;
      if (timeoutMs) {
        timeout = setTimeout(() => {
          uploadStream.destroy(new Error('Upload timed out'));
          reject(new Error(`Upload timed out after ${timeoutMs}ms`));
        }, timeoutMs);

        uploadStream.on('finish', () => clearTimeout(timeout));
        uploadStream.on('error', () => clearTimeout(timeout));
      }

      let sourceStream: NodeJS.ReadableStream | null = null;

      if (file.buffer) {
        sourceStream = Readable.from(file.buffer);
      } else if (file.stream) {
        sourceStream = file.stream;
      }

      if (!sourceStream) {
        const error = new Error('File has no buffer or stream to upload');
        this.logger.error(`❌ ${error.message}`);
        return reject(error);
      }

      sourceStream.on('error', (err: unknown) => {
        const error = err instanceof Error ? err : new Error(String(err));
        this.logger.error(`❌ File stream error: ${error.message}`);
        uploadStream.destroy(error);
        reject(error);
      });

      uploadStream.on('error', (err: unknown) => {
        const error = err instanceof Error ? err : new Error(String(err));
        this.logger.error(`❌ Cloudinary stream error: ${error.message}`);
        uploadStream.destroy(error);
        reject(error);
      });

      sourceStream.pipe(uploadStream);
    });
  }

  async deleteFile(publicId: string): Promise<void> {
    try {
      await this.cloudinary.uploader.destroy(publicId);
      this.logger.log(`🗑️ Deleted from Cloudinary: ${publicId}`);
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error(`Unknown delete error: ${String(err)}`);
      this.logger.error(
        `❌ Failed to delete file from Cloudinary: ${publicId}`,
        {
          stack: error.stack,
        },
      );
      throw error;
    }
  }
}
