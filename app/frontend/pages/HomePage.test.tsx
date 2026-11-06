import { screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { anArticleSummary, jsonResponse, renderWithProviders } from "~/test/render";
import { HomePage } from "./HomePage";

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe("HomePage", () => {
  it("shows the welcome jumbotron with a link to create an article", () => {
    fetchMock.mockReturnValue(new Promise(() => undefined));

    renderWithProviders(<HomePage />);

    expect(screen.getByRole("heading", { level: 1, name: "Welcome to ELI5ience!" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Create article/ })).toHaveAttribute("href", "/articles/new");
    expect(screen.getByRole("status")).toHaveTextContent("Loading articles...");
  });

  it("renders a card per article with excerpt, comment count and a link to the article", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        articles: [
          anArticleSummary({ id: 3, title: "Rocket Engines", excerpt: "A rocket engine...", comments_count: 3 }),
          anArticleSummary({ id: 4, title: "JavaScript", excerpt: "A language.", comments_count: 1 }),
        ],
      }),
    );

    renderWithProviders(<HomePage />);

    const card = within(await screen.findByRole("article", { name: "Rocket Engines" }));
    expect(card.getByText("A rocket engine...")).toBeInTheDocument();
    expect(card.getByText("3 Comments")).toBeInTheDocument();
    expect(card.getByRole("link", { name: /View article/ })).toHaveAttribute("href", "/articles/3");

    expect(screen.getByText("1 Comment")).toBeInTheDocument();
    expect(fetchMock.mock.lastCall?.[0]).toBe("/api/v1/articles");
  });

  it("shows an empty state when there are no articles", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ articles: [] }));

    renderWithProviders(<HomePage />);

    expect(await screen.findByText(/No articles yet/)).toBeInTheDocument();
  });

  it("shows the server error message and retries on request", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ error: { code: "unknown", message: "Boom", details: {} } }, 404),
    );

    renderWithProviders(<HomePage />);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Could not load articles");
    expect(alert).toHaveTextContent("Boom");
    expect(screen.queryByRole("article")).not.toBeInTheDocument();

    fetchMock.mockResolvedValueOnce(jsonResponse({ articles: [anArticleSummary({ title: "Recovered" })] }));
    screen.getByRole("button", { name: "Try again" }).click();

    expect(await screen.findByRole("heading", { name: "Recovered" })).toBeInTheDocument();
  });
});
