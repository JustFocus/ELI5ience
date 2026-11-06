import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { jsonResponse } from "~/test/render";
import { ApiError, request } from "./client";

const fetchMock = vi.fn<typeof fetch>();

function lastCall(): { url: string; init: RequestInit & { headers: Record<string, string> } } {
  const [url, init] = fetchMock.mock.lastCall ?? [];
  return { url: url as string, init: init as RequestInit & { headers: Record<string, string> } };
}

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  document.head.innerHTML = '<meta name="csrf-token" content="token-123">';
});

afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
  document.head.innerHTML = "";
});

describe("request", () => {
  it("sends same-origin credentials and Accept JSON, without a CSRF token on GET", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ user: null }));

    await expect(request("/api/v1/me")).resolves.toEqual({ user: null });

    const { url, init } = lastCall();
    expect(url).toBe("/api/v1/me");
    expect(init.method).toBe("GET");
    expect(init.credentials).toBe("same-origin");
    expect(init.headers.Accept).toBe("application/json");
    expect(init.headers["X-CSRF-Token"]).toBeUndefined();
  });

  it("sends the CSRF token from the meta tag and a JSON body on POST", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: 1 }, 201));

    await request("/api/v1/articles", { method: "POST", body: { title: "T", body: "B" } });

    const { init } = lastCall();
    expect(init.headers["X-CSRF-Token"]).toBe("token-123");
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(init.body).toBe('{"title":"T","body":"B"}');
  });

  it("sends the CSRF token on DELETE", async () => {
    fetchMock.mockResolvedValue(jsonResponse(null, 204));

    await request("/api/v1/comments/9", { method: "DELETE" });

    expect(lastCall().init.headers["X-CSRF-Token"]).toBe("token-123");
  });

  it("resolves 204 to undefined", async () => {
    fetchMock.mockResolvedValue(jsonResponse(null, 204));

    await expect(request("/api/v1/comments/9", { method: "DELETE" })).resolves.toBeUndefined();
  });

  it("parses the documented error shape into an ApiError", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        {
          error: {
            code: "validation_failed",
            message: "Title can't be blank",
            details: { title: ["can't be blank"] },
          },
        },
        422,
      ),
    );

    const error = await request("/api/v1/articles", { method: "POST", body: {} }).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 422,
      code: "validation_failed",
      message: "Title can't be blank",
      details: { title: ["can't be blank"] },
    });
  });

  it("falls back to an unknown error for a non-JSON error response", async () => {
    fetchMock.mockResolvedValue(new Response("<h1>Bad gateway</h1>", { status: 502, statusText: "Bad Gateway" }));

    const error = await request("/api/v1/articles").catch((e: unknown) => e);

    expect(error).toMatchObject({ status: 502, code: "unknown", message: "Bad Gateway", details: {} });
  });

  it("turns a network failure into an ApiError with status 0", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));

    const error = await request("/api/v1/articles").catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 0, code: "unknown" });
  });
});
