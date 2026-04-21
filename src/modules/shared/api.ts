import { type z } from "zod";
import { AppError, toErrorResponse } from "./errors";

export async function parseJson<TSchema extends z.ZodType>(request: Request, schema: TSchema) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    throw new AppError("Request body must be valid JSON", 400, "invalid_json");
  }

  return schema.parse(body);
}

export function ok<T>(data: T, init?: ResponseInit) {
  return Response.json(data, init);
}

export function created<T>(data: T) {
  return Response.json(data, { status: 201 });
}

export async function route(handler: () => Promise<Response>) {
  try {
    return await handler();
  } catch (error) {
    return toErrorResponse(error);
  }
}

export function assertUuid(value: string, label = "id") {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
    throw new AppError(`${label} must be a valid UUID`, 422, "invalid_uuid");
  }

  return value;
}
