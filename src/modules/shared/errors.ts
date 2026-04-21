import { ZodError } from "zod";

export class AppError extends Error {
  constructor(
    message: string,
    public readonly status = 500,
    public readonly code = "internal_error"
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function toErrorResponse(error: unknown) {
  if (error instanceof AppError) {
    return Response.json(
      {
        error: {
          code: error.code,
          message: error.message
        }
      },
      { status: error.status }
    );
  }

  if (error instanceof ZodError) {
    return Response.json(
      {
        error: {
          code: "validation_error",
          message: "Invalid request payload",
          issues: error.issues
        }
      },
      { status: 422 }
    );
  }

  return Response.json(
    {
      error: {
        code: "internal_error",
        message: "Something went wrong"
      }
    },
    { status: 500 }
  );
}

export const unauthorized = () => new AppError("Authentication is required", 401, "unauthorized");
export const forbidden = () => new AppError("You do not have access to this resource", 403, "forbidden");
export const notFound = (resource = "Resource") => new AppError(`${resource} was not found`, 404, "not_found");
export const conflict = (message: string) => new AppError(message, 409, "conflict");
