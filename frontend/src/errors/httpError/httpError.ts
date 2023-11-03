export class HttpError extends Error {
  statusCode: number;

  constructor(options: { message: string; statusCode: number }) {
    super(options.message);
    this.statusCode = options.statusCode;
  }
}
