import { UploadApiResponse } from 'cloudinary';

export type CloudinarySlim = Pick<
  UploadApiResponse,
  | 'public_id'
  | 'secure_url'
  | 'format'
  | 'width'
  | 'height'
  | 'bytes'
  | 'resource_type'
  | 'duration'
  | 'playback_url'
  | 'eager'
>;

export type CloudinaryUploadMapped =
  | ({ success: true; filename: string } & CloudinarySlim)
  | { success: false; filename: string; error: string };
