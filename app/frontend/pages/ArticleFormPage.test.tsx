import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Route, Routes, useParams } from "react-router";
import { anArticle, aUser, jsonResponse, renderWithProviders } from "~/test/render";
import { ArticleFormPage } from "./ArticleFormPage";

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  return input instanceof URL ? input.href : input.url;
}

/** Serves GET /api/v1/me with `user`, and `handlers` for any other "METHOD path" key. */
function mockApi(user: typeof aUser | null, handlers: Record<string, () => Promise<Response>> = {}) {
  fetchMock.mockImplementation((input, init) => {
    const key = `${init?.method ?? "GET"} ${requestUrl(input)}`;
    if (key === "GET /api/v1/me") return Promise.resolve(jsonResponse({ user }));
    const handler = handlers[key];
    if (!handler) return Promise.reject(new Error(`Unexpected request ${key}`));
    return handler();
  });
}

function postedBodies(): unknown[] {
  return fetchMock.mock.calls
    .filter(([, init]) => init?.method === "POST")
    .map(([, init]) => JSON.parse(typeof init?.body === "string" ? init.body : "") as unknown);
}

function ArticlePlaceholder() {
  const { id } = useParams();
  return <p>Article {id} page</p>;
}

function renderPage() {
  return renderWithProviders(
    <Routes>
      <Route path="/articles/new" element={<ArticleFormPage />} />
      <Route path="/articles/:id" element={<ArticlePlaceholder />} />
    </Routes>,
    { route: "/articles/new" },
  );
}

describe("ArticleFormPage", () => {
  it("shows the fields with visible labels", async () => {
    mockApi(aUser);

    renderPage();

    expect(screen.getByRole("heading", { level: 1, name: "Create An Article!" })).toBeInTheDocument();
    // The fields appear once the login state is known.
    expect(await screen.findByRole("textbox", { name: "Title" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Body" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Image link (optional)" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create article" })).toBeInTheDocument();
  });

  describe("logged in", () => {
    it("shows the submit button and a Cancel link back to the home page", async () => {
      mockApi(aUser);

      renderPage();

      expect(await screen.findByRole("button", { name: "Create article" })).toBeEnabled();
      expect(screen.getByRole("link", { name: "Cancel" })).toHaveAttribute("href", "/");
      expect(screen.queryByRole("link", { name: "Login to create an article!" })).not.toBeInTheDocument();
    });

    it("shows the field messages without sending a request when the fields are empty", async () => {
      mockApi(aUser);
      renderPage();
      const submit = await screen.findByRole("button", { name: "Create article" });

      await userEvent.click(submit);

      expect(screen.getByText("Title is required.")).toBeInTheDocument();
      expect(screen.getByText("Body is required.")).toBeInTheDocument();
      expect(screen.getByRole("textbox", { name: "Title" })).toHaveAttribute("aria-invalid", "true");
      expect(postedBodies()).toEqual([]);
    });

    it("rejects a non-http image link before sending", async () => {
      mockApi(aUser);
      renderPage();
      await screen.findByRole("button", { name: "Create article" });

      await userEvent.type(screen.getByRole("textbox", { name: "Title" }), "Title");
      await userEvent.type(screen.getByRole("textbox", { name: "Body" }), "Body");
      await userEvent.type(screen.getByRole("textbox", { name: "Image link (optional)" }), "javascript:alert(1)");
      await userEvent.click(screen.getByRole("button", { name: "Create article" }));

      expect(screen.getByText("Image link must be an http or https URL.")).toBeInTheDocument();
      expect(postedBodies()).toEqual([]);
    });

    it("clears a client message once its field is fixed", async () => {
      mockApi(aUser);
      renderPage();
      await screen.findByRole("button", { name: "Create article" });
      await userEvent.click(screen.getByRole("button", { name: "Create article" }));
      expect(screen.getByText("Title is required.")).toBeInTheDocument();

      await userEvent.type(screen.getByRole("textbox", { name: "Title" }), "A title");

      expect(screen.queryByText("Title is required.")).not.toBeInTheDocument();
      expect(screen.getByText("Body is required.")).toBeInTheDocument();
    });

    it("shows the server's field errors next to their fields and keeps the typed values", async () => {
      mockApi(aUser, {
        "POST /api/v1/articles": () =>
          Promise.resolve(
            jsonResponse(
              {
                error: {
                  code: "validation_failed",
                  message: "Title is too long",
                  details: { title: ["is too long (maximum is 200 characters)"], image_link: ["must be an http or https URL"] },
                },
              },
              422,
            ),
          ),
      });
      renderPage();
      await screen.findByRole("button", { name: "Create article" });
      await userEvent.type(screen.getByRole("textbox", { name: "Title" }), "My title");
      await userEvent.type(screen.getByRole("textbox", { name: "Body" }), "My body");
      await userEvent.type(screen.getByRole("textbox", { name: "Image link (optional)" }), "https://example.com/a.png");
      await userEvent.click(screen.getByRole("button", { name: "Create article" }));

      const title = await screen.findByRole("textbox", { name: "Title" });
      expect(screen.getByText("is too long (maximum is 200 characters)")).toBeInTheDocument();
      expect(title).toHaveAccessibleDescription("is too long (maximum is 200 characters)");
      expect(screen.getByRole("textbox", { name: "Image link (optional)" })).toHaveAccessibleDescription(
        "must be an http or https URL",
      );
      expect(screen.getByRole("textbox", { name: "Body" })).not.toHaveAttribute("aria-invalid");

      expect(title).toHaveValue("My title");
      expect(screen.getByRole("textbox", { name: "Body" })).toHaveValue("My body");
      expect(screen.getByRole("button", { name: "Create article" })).toBeEnabled();
    });

    it("shows a whole-form error when the server rejects without field details", async () => {
      mockApi(aUser, {
        "POST /api/v1/articles": () =>
          Promise.resolve(jsonResponse({ error: { code: "validation_failed", message: "Nope", details: {} } }, 422)),
      });
      renderPage();
      await screen.findByRole("button", { name: "Create article" });
      await userEvent.type(screen.getByRole("textbox", { name: "Title" }), "T");
      await userEvent.type(screen.getByRole("textbox", { name: "Body" }), "B");
      await userEvent.click(screen.getByRole("button", { name: "Create article" }));

      expect(await screen.findByRole("alert")).toHaveTextContent("Could not create the article");
      expect(screen.getByRole("alert")).toHaveTextContent("Nope");
    });

    it("disables the submit button while the request is in flight", async () => {
      let finish: (response: Response) => void = () => undefined;
      mockApi(aUser, {
        "POST /api/v1/articles": () => new Promise<Response>((resolve) => (finish = resolve)),
      });
      renderPage();
      await screen.findByRole("button", { name: "Create article" });
      await userEvent.type(screen.getByRole("textbox", { name: "Title" }), "T");
      await userEvent.type(screen.getByRole("textbox", { name: "Body" }), "B");
      await userEvent.click(screen.getByRole("button", { name: "Create article" }));

      expect(screen.getByRole("button", { name: "Create article" })).toBeDisabled();

      finish(jsonResponse(anArticle({ id: 9 }), 201));
      expect(await screen.findByText("Article 9 page")).toBeInTheDocument();
    });

    it("posts the trimmed values and navigates to the new article", async () => {
      mockApi(aUser, {
        "POST /api/v1/articles": () => Promise.resolve(jsonResponse(anArticle({ id: 42, title: "Sky" }), 201)),
      });
      renderPage();
      await screen.findByRole("button", { name: "Create article" });
      await userEvent.type(screen.getByRole("textbox", { name: "Title" }), "  Sky  ");
      await userEvent.type(screen.getByRole("textbox", { name: "Body" }), "Blue light");
      await userEvent.click(screen.getByRole("button", { name: "Create article" }));

      expect(await screen.findByText("Article 42 page")).toBeInTheDocument();
      expect(postedBodies()).toEqual([{ title: "Sky", body: "Blue light", image_link: null }]);
    });

    it("sends the image link when one is given", async () => {
      mockApi(aUser, {
        "POST /api/v1/articles": () => Promise.resolve(jsonResponse(anArticle({ id: 5 }), 201)),
      });
      renderPage();
      await screen.findByRole("button", { name: "Create article" });
      await userEvent.type(screen.getByRole("textbox", { name: "Title" }), "T");
      await userEvent.type(screen.getByRole("textbox", { name: "Body" }), "B");
      await userEvent.type(screen.getByRole("textbox", { name: "Image link (optional)" }), "https://example.com/x.jpg");
      await userEvent.click(screen.getByRole("button", { name: "Create article" }));

      await waitFor(() => {
        expect(postedBodies()).toHaveLength(1);
      });
      expect(postedBodies()[0]).toEqual({ title: "T", body: "B", image_link: "https://example.com/x.jpg" });
    });
  });

  describe("logged out", () => {
    it("shows a login link instead of the submit button", async () => {
      mockApi(null);

      renderPage();

      const login = await screen.findByRole("link", { name: "Login to create an article!" });
      expect(login).toHaveAttribute("href", "/session/new");
      expect(screen.queryByRole("button", { name: "Create article" })).not.toBeInTheDocument();
    });
  });
});
