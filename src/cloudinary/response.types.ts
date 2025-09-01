import { UploadApiOptions } from 'cloudinary';

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
