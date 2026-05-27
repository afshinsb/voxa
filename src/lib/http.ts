import { NextResponse } from "next/server";

export class ApiError extends Error {
  constructor(
    message: string,
    public status = 500,
    public code = "api_error",
  ) {
    super(message);
  }
}

export function jsonError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.status },
    );
  }

  const message = error instanceof Error ? error.message : "Unexpected server error.";
  return NextResponse.json({ error: message, code: "unexpected_error" }, { status: 500 });
}

export async function parseJson<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new ApiError("Request body must be valid JSON.", 400, "invalid_json");
  }
}
