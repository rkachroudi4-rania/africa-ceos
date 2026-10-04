import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return jsonError(error.message, error.status);
  }
  if (error instanceof ZodError) {
    const message = error.errors.map((e) => e.message).join(", ");
    return jsonError(message, 422);
  }
  console.error(error);
  return jsonError("An unexpected error occurred.", 500);
}
