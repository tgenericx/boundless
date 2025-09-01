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
      let settled = false;
      let timeout: NodeJS.Timeout | undefined;

      const safeResolve = (value: UploadApiResponse) => {
        if (!settled) {
          settled = true;
          clearTimeoutSafely();
          resolve(value);
        }
      };

      const safeReject = (err: Error) => {
        if (!settled) {
          settled = true;
          clearTimeoutSafely();
          reject(err);
        }
      };

      const clearTimeoutSafely = () => {
        if (timeout) {
          clearTimeout(timeout);
          timeout = undefined;
        }
      };

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
            return safeReject(err);
          }

          if (!result) {
            return safeReject(
              new CloudinaryUploadError(
                'Cloudinary returned no result.',
                500,
                'CloudinaryUploadError',
              ),
            );
          }

          this.logger.log(
            `✅ Uploaded ${file.originalname} → ${result.secure_url} (public_id=${result.public_id})`,
          );
          return safeResolve(result);
        },
      );

      if (timeoutMs) {
        timeout = setTimeout(() => {
          const err = new Error(`Upload timed out after ${timeoutMs}ms`);
          uploadStream.destroy(err);
          safeReject(err);
        }, timeoutMs);
      }

      let sourceStream: NodeJS.ReadableStream | null = null;

      if (file.buffer) {
        sourceStream = Readable.from(file.buffer);
      } else if (file.stream) {
        sourceStream = file.stream;
      }

      if (!sourceStream) {
        return safeReject(new Error('File has no buffer or stream to upload'));
      }

      sourceStream.on('error', (err: unknown) => {
        const error = err instanceof Error ? err : new Error(String(err));
        this.logger.error(`❌ File stream error: ${error.message}`);
        uploadStream.destroy(error);
        safeReject(error);
      });

      uploadStream.on('error', (err: unknown) => {
        const error = err instanceof Error ? err : new Error(String(err));
        this.logger.error(`❌ Cloudinary stream error: ${error.message}`);
        uploadStream.destroy(error);
        safeReject(error);
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
