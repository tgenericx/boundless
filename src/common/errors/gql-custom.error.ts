export class GqlCustomError extends Error {
  constructor(
    public error: string,
    message: string,
    public status?: number,
    public code?: string,
  ) {
    super(message);
  }
}
