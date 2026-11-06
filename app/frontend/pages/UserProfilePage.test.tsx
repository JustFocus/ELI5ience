import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Route, Routes } from "react-router";
import type { User, UserProfile } from "~/types/api";
import { anArticleSummary, aUser, jsonResponse, renderWithProviders } from "~/test/render";
import { UserProfilePage } from "./UserProfilePage";

const fetchMock = vi.fn<typeof fetch>();
const confirmMock = vi.fn<(message?: string) => boolean>();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal("confirm", confirmMock);
});

afterEach(() => {
  fetchMock.mockReset();
  confirmMock.mockReset();
  vi.unstubAllGlobals();
});

const OWNER: User = aUser; // id 7, the profile's owner
const VISITOR: User = { id: 8, username: "ada", expertise: "Physicist" };

function aProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    id: 7,
    username: "carl_s",
    expertise: "Astrophysicist",
    created_at: "2026-03-01T10:00:00.000Z",
    articles: [
      anArticleSummary({ id: 3, title: "Why is the sky blue?", user: OWNER }),
      anArticleSummary({ id: 4, title: "Electromagnetism", user: OWNER }),
    ],
    ...overrides,
  };
}

function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  return input instanceof URL ? input.href : input.url;
}

/**
 * Serves the given viewer on GET /api/v1/me and `handlers` keyed by "METHOD path".
 * A handler is a function so the same request can answer differently later.
 */
function mockApi(viewer: User | null, handlers: Record<string, () => Promise<Response>>) {
  fetchMock.mockImplementation((input, init) => {
    const key = `${init?.method ?? "GET"} ${requestUrl(input)}`;
    if (key === "GET /api/v1/me") return Promise.resolve(jsonResponse({ user: viewer }));
    const handler = handlers[key];
    if (!handler) return Promise.reject(new Error(`Unexpected request ${key}`));
    return handler();
  });
}

function requestKeys(): string[] {
  return fetchMock.mock.calls.map(([input, init]) => `${init?.method ?? "GET"} ${requestUrl(input)}`);
}

function renderProfile(id = 7) {
  return renderWithProviders(
    <Routes>
      <Route path="/users/:id" element={<UserProfilePage />} />
    </Routes>,
    { route: `/users/${id}` },
  );
}

/** The Delete button in the row of the article with this title. */
async function deleteButtonFor(title: string): Promise<HTMLElement> {
  const row = (await screen.findByRole("link", { name: title })).parentElement;
  if (!row) throw new Error(`No row for ${title}`);
  // Delete buttons appear once the viewer is known, which can be after the list.
  return within(row).findByRole("button", { name: "Delete" });
}

describe("UserProfilePage", () => {
  it("shows the username, expertise and the user's articles", async () => {
    mockApi(null, { "GET /api/v1/users/7": () => Promise.resolve(jsonResponse(aProfile())) });

    renderProfile();

    expect(await screen.findByRole("heading", { name: "carl_s's Articles:" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "User Info:" })).toBeInTheDocument();
    expect(screen.getByText("Username:").closest("li")).toHaveTextContent("Username: carl_s");
    expect(screen.getByText("Expertise:").closest("li")).toHaveTextContent("Expertise: Astrophysicist");
    expect(screen.getByRole("link", { name: "Why is the sky blue?" })).toHaveAttribute("href", "/articles/3");
    expect(screen.getByRole("link", { name: "Electromagnetism" })).toHaveAttribute("href", "/articles/4");
  });

  it("shows an empty state when the user has no articles", async () => {
    mockApi(null, { "GET /api/v1/users/7": () => Promise.resolve(jsonResponse(aProfile({ articles: [] }))) });

    renderProfile();

    expect(await screen.findByText("No articles yet.")).toBeInTheDocument();
  });

  describe("logged out", () => {
    it("shows the articles but no owner controls", async () => {
      mockApi(null, { "GET /api/v1/users/7": () => Promise.resolve(jsonResponse(aProfile())) });

      renderProfile();

      await screen.findByRole("link", { name: "Electromagnetism" });
      expect(screen.queryByRole("button", { name: "Delete" })).not.toBeInTheDocument();
      expect(screen.queryByRole("link", { name: "Create article" })).not.toBeInTheDocument();
    });
  });

  describe("logged in as a different user", () => {
    it("shows the articles but no owner controls", async () => {
      mockApi(VISITOR, { "GET /api/v1/users/7": () => Promise.resolve(jsonResponse(aProfile())) });

      renderProfile();

      await screen.findByRole("link", { name: "Electromagnetism" });
      expect(screen.queryByRole("button", { name: "Delete" })).not.toBeInTheDocument();
      expect(screen.queryByRole("link", { name: "Create article" })).not.toBeInTheDocument();
    });
  });

  describe("logged in as the owner", () => {
    it("shows a Create article link to the form and a Delete button in each article row", async () => {
      mockApi(OWNER, { "GET /api/v1/users/7": () => Promise.resolve(jsonResponse(aProfile())) });

      renderProfile();

      expect(await screen.findByRole("link", { name: "Create article" })).toHaveAttribute("href", "/articles/new");
      expect(await deleteButtonFor("Why is the sky blue?")).toBeEnabled();
      expect(await deleteButtonFor("Electromagnetism")).toBeEnabled();
      expect(screen.getAllByRole("button", { name: "Delete" })).toHaveLength(2);
    });

    it("does not delete when the confirmation is cancelled", async () => {
      confirmMock.mockReturnValue(false);
      mockApi(OWNER, { "GET /api/v1/users/7": () => Promise.resolve(jsonResponse(aProfile())) });
      renderProfile();
      await userEvent.click(await deleteButtonFor("Why is the sky blue?"));

      expect(confirmMock).toHaveBeenCalledWith(expect.stringContaining("Why is the sky blue?"));
      expect(requestKeys().some((key) => key.startsWith("DELETE"))).toBe(false);
      expect(screen.getByRole("link", { name: "Why is the sky blue?" })).toBeInTheDocument();
    });

    it("deletes the confirmed article and removes it from the list without a reload", async () => {
      confirmMock.mockReturnValue(true);
      let profile = aProfile();
      mockApi(OWNER, {
        "GET /api/v1/users/7": () => Promise.resolve(jsonResponse(profile)),
        "DELETE /api/v1/articles/3": () => {
          profile = aProfile({ articles: [anArticleSummary({ id: 4, title: "Electromagnetism", user: OWNER })] });
          return Promise.resolve(new Response(null, { status: 204 }));
        },
      });
      renderProfile();
      await userEvent.click(await deleteButtonFor("Why is the sky blue?"));

      await waitFor(() => expect(screen.queryByRole("link", { name: "Why is the sky blue?" })).not.toBeInTheDocument());
      expect(screen.getByRole("link", { name: "Electromagnetism" })).toBeInTheDocument();
      expect(screen.getAllByRole("button", { name: "Delete" })).toHaveLength(1);
      expect(requestKeys().filter((key) => key === "DELETE /api/v1/articles/3")).toHaveLength(1);
    });

    it("shows the server error when the delete fails and keeps the article", async () => {
      confirmMock.mockReturnValue(true);
      mockApi(OWNER, {
        "GET /api/v1/users/7": () => Promise.resolve(jsonResponse(aProfile())),
        "DELETE /api/v1/articles/3": () =>
          Promise.resolve(jsonResponse({ error: { code: "not_found", message: "Not found", details: {} } }, 404)),
      });
      renderProfile();
      await userEvent.click(await deleteButtonFor("Why is the sky blue?"));

      const alert = await screen.findByRole("alert");
      expect(alert).toHaveTextContent("Could not delete the article");
      expect(alert).toHaveTextContent("Not found");
      expect(screen.getByRole("link", { name: "Why is the sky blue?" })).toBeInTheDocument();
    });
  });

  it("shows a not-found error when there is no such user", async () => {
    mockApi(null, {
      "GET /api/v1/users/999": () =>
        Promise.resolve(jsonResponse({ error: { code: "not_found", message: "Not found", details: {} } }, 404)),
    });

    renderProfile(999);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("User not found");
    expect(alert).toHaveTextContent("No user has this id.");
    expect(screen.queryByRole("button", { name: "Try again" })).not.toBeInTheDocument();
  });

  it("offers to retry when the profile fails to load for another reason", async () => {
    mockApi(null, {
      "GET /api/v1/users/7": () =>
        Promise.resolve(jsonResponse({ error: { code: "unknown", message: "Boom", details: {} } }, 500)),
    });

    renderProfile();

    expect(await screen.findByRole("alert")).toHaveTextContent("Could not load this profile");
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
  });
});
