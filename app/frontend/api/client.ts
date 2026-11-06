import type { ApiErrorBody, ApiErrorCode, ErrorDetails } from "~/types/api";

/** Thrown for every non-2xx response and for network failures (status 0). */
export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly details: ErrorDetails;

  constructor(status: number, code: ApiErrorCode, message: string, details: ErrorDetails = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export interface RequestOptions {
  method?: "GET" | "POST" | "DELETE";
  /** Serialized as a flat JSON object. */
  body?: unknown;
  signal?: AbortSignal;
}

function csrfToken(): string | undefined {
  return document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content;
}

function isErrorBody(value: unknown): value is ApiErrorBody {
  if (typeof value !== "object" || value === null || !("error" in value)) return false;
  const error = value.error;
  return typeof error === "object" && error !== null && "code" in error && "message" in error;
}

async function toApiError(response: Response): Promise<ApiError> {
  let parsed: unknown;
  try {
    parsed = await response.json();
  } catch {
    parsed = undefined;
  }
  if (isErrorBody(parsed)) {
    const { code, message, details } = parsed.error;
    return new ApiError(response.status, code, message, details);
  }
  return new ApiError(response.status, "unknown", response.statusText || `Request failed (${response.status})`);
}

/**
 * Same-origin JSON request against the Rails API. Sends the CSRF token on
 * non-GET requests. Resolves to the parsed body, or `undefined` for 204.
 * Rejects with ApiError.
 */
export async function request<T>(path: string, { method = "GET", body, signal }: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (method !== "GET") {
    const token = csrfToken();
    if (token) headers["X-CSRF-Token"] = token;
  }

  let response: Response;
  try {
    response = await fetch(path, {
      method,
      headers,
      credentials: "same-origin",
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiError(0, "unknown", "Could not reach the server. Check your connection and try again.");
  }

  if (!response.ok) throw await toApiError(response);
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
