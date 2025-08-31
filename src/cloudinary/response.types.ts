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
