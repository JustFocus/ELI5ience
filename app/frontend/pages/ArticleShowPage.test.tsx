import { act, fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from "vitest";
import type { Annotation, Article, Comment, Improvement, User } from "~/types/api";
import { aUser, anArticle, jsonResponse, renderWithProviders } from "~/test/render";
import { ArticleShowPage } from "./ArticleShowPage";

const fetchMock = vi.fn<typeof fetch>();
let confirmSpy: MockInstance<typeof window.confirm>;

function urlOf(input: Parameters<typeof fetch>[0]): string {
  if (typeof input === "string") return input;
  return input instanceof URL ? input.href : input.url;
}

const ada: User = { id: 8, username: "ada", expertise: "Physicist" };
const guest: User = { id: 9, username: "guest_user", expertise: null };

const BODY = "Sunlight is light. Since they fly. Since they swim.";

function improvement(overrides: Partial<Improvement> = {}): Improvement {
  return {
    id: 5,
    annotation_id: 11,
    body: "Say it simpler.",
    user: guest,
    created_at: "2026-03-02T19:30:00.000Z",
    ...overrides,
  };
}

function annotation(overrides: Partial<Annotation> = {}): Annotation {
  return {
    id: 11,
    article_id: 3,
    selection_start: 0,
    selection_length: 8,
    body: "Light from the sun.",
    user: ada,
    improvements: [improvement()],
    created_at: "2026-03-02T19:00:00.000Z",
    ...overrides,
  };
}

function comment(overrides: Partial<Comment> = {}): Comment {
  return {
    id: 9,
    article_id: 3,
    body: "Great explanation!",
    user: guest,
    created_at: "2026-03-02T19:10:00.000Z",
    ...overrides,
  };
}

function article(overrides: Partial<Article> = {}): Article {
  return anArticle({ body: BODY, annotations: [annotation()], comments: [comment()], ...overrides });
}

/** Route fetches by method and path. `me` is the logged-in user or null. */
function serve(data: Article, me: User | null, handlers: Record<string, () => Response> = {}) {
  fetchMock.mockImplementation((input, init) => {
    const method = init?.method ?? "GET";
    const path = urlOf(input);
    const handler = handlers[`${method} ${path}`];
    if (handler) return Promise.resolve(handler());
    if (path === "/api/v1/me") return Promise.resolve(jsonResponse({ user: me }));
    if (path === `/api/v1/articles/${data.id}`) return Promise.resolve(jsonResponse(data));
    return Promise.resolve(jsonResponse({ error: { code: "not_found", message: "Not found", details: {} } }, 404));
  });
}

function renderPage(route = "/articles/3") {
  return renderWithProviders(
    <Routes>
      <Route path="/articles/:id" element={<ArticleShowPage />} />
      <Route path="/articles/:id/annotations/:annotationId" element={<ArticleShowPage />} />
    </Routes>,
    { route },
  );
}

/** Select `text` (first occurrence at or after `from`) in the body like a user drag, then release the mouse. */
function selectInBody(text: string, from = 0) {
  const body = screen.getByTestId("article-body");
  const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let full = "";
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    nodes.push(n as Text);
    full += (n as Text).data;
  }
  const start = full.indexOf(text, from);
  const end = start + text.length;
  const locate = (offset: number, isEnd: boolean) => {
    let pos = 0;
    for (const node of nodes) {
      if (isEnd ? offset <= pos + node.data.length : offset < pos + node.data.length) {
        return { node, offset: offset - pos };
      }
      pos += node.data.length;
    }
    throw new Error("offset");
  };
  const s = locate(start, false);
  const e = locate(end, true);
  const range = document.createRange();
  range.setStart(s.node, s.offset);
  range.setEnd(e.node, e.offset);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
  fireEvent.mouseUp(body);
}

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
});

afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  window.getSelection()?.removeAllRanges();
});

describe("ArticleShowPage header and body", () => {
  it("shows the title, submitter, expertise and image, and highlights as links", async () => {
    serve(article({ image_link: "https://example.com/sky.jpg" }), null);
    const { container } = renderPage();

    expect(await screen.findByRole("heading", { level: 1, name: "Why is the sky blue?" })).toBeInTheDocument();
    const submitted = screen.getByText("Submitted by:").closest("p") as HTMLElement;
    expect(within(submitted).getByRole("link", { name: "carl_s" })).toHaveAttribute("href", `/users/${aUser.id}`);
    expect(submitted).toHaveTextContent("Expertise: Astrophysicist");
    expect(container.querySelector("img")).toHaveAttribute("src", "https://example.com/sky.jpg");

    const body = screen.getByTestId("article-body");
    expect(body).toHaveTextContent(BODY);
    expect(body.textContent).toBe(BODY);
    expect(within(body).getByRole("link", { name: "Sunlight" })).toHaveAttribute("href", "/articles/3/annotations/11");
  });

  it("omits the image and expertise when absent", async () => {
    serve(article({ user: { ...aUser, expertise: null } }), null);
    const { container } = renderPage();
    await screen.findByRole("heading", { level: 1 });
    expect(container.querySelector("img")).toBeNull();
    expect(screen.queryByText("Expertise:")).toBeNull();
  });

  it("shows loading, then an error with a retry for a missing article", async () => {
    serve(article({ id: 99 }), null);
    renderPage("/articles/3");
    expect(screen.getByRole("status")).toHaveTextContent("Loading article...");
    expect(await screen.findByRole("alert")).toHaveTextContent("Could not load the article");
  });

  it("shows the hint when no annotation is open", async () => {
    serve(article(), null);
    renderPage();
    const panel = await screen.findByTestId("annotation-panel");
    expect(panel).toHaveTextContent(/select text to create an annotation/i);
  });
});

describe("annotation panel", () => {
  it("opens the annotation from a deep link with its improvements and expertise once", async () => {
    serve(article(), null);
    renderPage("/articles/3/annotations/11");

    const panel = await screen.findByTestId("annotation-panel");
    expect(panel).toHaveTextContent("Light from the sun.");
    expect(within(panel).getByRole("link", { name: "ada" })).toHaveAttribute("href", "/users/8");
    expect(panel).toHaveTextContent("1 Annotation Improvements");
    const item = within(panel).getByRole("listitem");
    expect(item).toHaveTextContent("Say it simpler.");
    expect(within(item).getByRole("link", { name: "guest_user" })).toBeInTheDocument();
    expect(await within(panel).findByRole("link", { name: "Login to suggest an improvement!" })).toHaveAttribute(
      "href",
      "/session/new",
    );
    expect(within(panel).queryByRole("button", { name: "Post" })).toBeNull();
    expect(within(panel).queryByRole("button", { name: "Delete" })).toBeNull();
  });

  it("shows expertise once per improvement", async () => {
    serve(article({ annotations: [annotation({ improvements: [improvement({ user: ada })] })] }), null);
    renderPage("/articles/3/annotations/11");
    const panel = await screen.findByTestId("annotation-panel");
    const item = await within(panel).findByRole("listitem");
    expect(item.textContent.match(/Physicist/g)).toHaveLength(1);
  });

  it("clicking a highlight navigates and shows the annotation", async () => {
    serve(article(), null);
    renderPage();
    await userEvent.click(await screen.findByRole("link", { name: "Sunlight" }));
    expect(await screen.findByText("Light from the sun.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sunlight" })).toHaveAttribute("aria-current", "true");
  });

  it("explains an unknown annotation id", async () => {
    serve(article(), null);
    renderPage("/articles/3/annotations/404");
    expect(await screen.findByText(/no longer exists/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to the article" })).toHaveAttribute("href", "/articles/3");
  });

  it("offers Delete only to the owner, confirms, deletes and returns to the article", async () => {
    serve(article(), ada, { "DELETE /api/v1/annotations/11": () => jsonResponse(undefined, 204) });
    renderPage("/articles/3/annotations/11");
    const panel = await screen.findByTestId("annotation-panel");
    await userEvent.click(await within(panel).findByRole("button", { name: "Delete" }));
    expect(confirmSpy).toHaveBeenCalledWith("Are you sure you want to delete your annotation?");
    await waitFor(() => { expect(screen.queryByRole("link", { name: "Sunlight" })).toBeNull(); });
    expect(screen.getByTestId("annotation-panel")).toHaveTextContent(/select text/i);
  });

  it("does not delete when the confirm is cancelled", async () => {
    confirmSpy.mockReturnValue(false);
    serve(article(), ada);
    renderPage("/articles/3/annotations/11");
    await userEvent.click(await screen.findByRole("button", { name: "Delete" }));
    expect(fetchMock.mock.calls.some(([, init]) => init?.method === "DELETE")).toBe(false);
  });

  it("shows no Delete to other users", async () => {
    serve(article(), { id: 77, username: "other", expertise: null });
    renderPage("/articles/3/annotations/11");
    await screen.findByText("Light from the sun.");
    expect(screen.queryByRole("button", { name: "Delete" })).toBeNull();
  });
});

describe("selecting text", () => {
  it("opens the form for a valid selection and anchors a repeated phrase to the selected occurrence", async () => {
    const created = annotation({ id: 12, selection_start: BODY.lastIndexOf("Since they"), selection_length: 10, body: "Second." });
    serve(article(), guest, { "POST /api/v1/articles/3/annotations": () => jsonResponse(created, 201) });
    renderPage();
    await screen.findByTestId("article-body");
    await screen.findByRole("textbox", { name: "Add a comment..." });

    selectInBody("Since they", BODY.indexOf("Since they") + 1);
    expect(await screen.findByText("Creating annotation for:")).toBeInTheDocument();
    expect(screen.getByText('"Since they"')).toBeInTheDocument();

    await userEvent.type(screen.getByRole("textbox", { name: "Add annotation..." }), "Second.");
    await userEvent.click(screen.getByRole("button", { name: "Create annotation" }));

    await waitFor(() => { expect(screen.getAllByRole("link", { name: "Since they" })).toHaveLength(1); });
    const post = fetchMock.mock.calls.find(([, init]) => init?.method === "POST");
    expect(JSON.parse(post?.[1]?.body as string)).toEqual({
      selection_start: BODY.lastIndexOf("Since they"),
      selection_length: 10,
      body: "Second.",
    });
    expect(await screen.findByText("Second.")).toBeInTheDocument();
  });

  it("shows an inline message instead of a form when the selection overlaps an annotation", async () => {
    serve(article(), guest);
    renderPage();
    await screen.findByTestId("article-body");
    selectInBody("ht is light");
    expect(await screen.findByText(/overlaps an existing annotation/)).toBeInTheDocument();
    expect(screen.queryByText("Creating annotation for:")).toBeNull();
    expect(screen.getByTestId("annotation-panel")).toHaveTextContent(/select text to create/i);
  });

  it("allows a selection that touches an annotation", async () => {
    serve(article(), guest);
    renderPage();
    await screen.findByTestId("article-body");
    selectInBody(" is light");
    expect(await screen.findByText("Creating annotation for:")).toBeInTheDocument();
  });

  it("ignores collapsed selections and clicks", async () => {
    serve(article(), guest);
    renderPage();
    await screen.findByTestId("article-body");
    window.getSelection()?.removeAllRanges();
    fireEvent.mouseUp(screen.getByTestId("article-body"));
    expect(screen.queryByText("Creating annotation for:")).toBeNull();
  });

  it("gives logged-out users a login prompt and no submit", async () => {
    serve(article(), null);
    renderPage();
    await screen.findByTestId("article-body");
    await screen.findByRole("link", { name: "Login to post a comment!" });
    selectInBody("Since they");
    expect(await screen.findByText("Creating annotation for:")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Login to create an annotation!" })).toHaveAttribute("href", "/session/new");
    expect(screen.queryByRole("button", { name: "Create annotation" })).toBeNull();
    expect(screen.queryByRole("textbox", { name: "Add annotation..." })).toBeNull();
  });

  it("shows the server message on a 422 and keeps the draft, and Cancel closes the form", async () => {
    serve(article(), guest, {
      "POST /api/v1/articles/3/annotations": () =>
        jsonResponse(
          {
            error: {
              code: "validation_failed",
              message: "Selection start overlaps an existing annotation",
              details: { selection_start: ["overlaps an existing annotation"] },
            },
          },
          422,
        ),
    });
    renderPage();
    await screen.findByTestId("article-body");
    await screen.findByRole("textbox", { name: "Add a comment..." });
    selectInBody("Since they");
    await userEvent.type(await screen.findByRole("textbox", { name: "Add annotation..." }), "Mine");
    await userEvent.click(screen.getByRole("button", { name: "Create annotation" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Selection start overlaps an existing annotation");
    expect(screen.getByRole("textbox", { name: "Add annotation..." })).toHaveValue("Mine");

    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByText("Creating annotation for:")).toBeNull();
  });

  it("drops a pending form when the route changes", async () => {
    serve(article(), guest);
    renderPage();
    await screen.findByTestId("article-body");
    selectInBody("Since they");
    expect(await screen.findByText("Creating annotation for:")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("link", { name: "Sunlight" }));
    expect(screen.queryByText("Creating annotation for:")).toBeNull();
    expect(await screen.findByText("Light from the sun.")).toBeInTheDocument();
  });
});

describe("improvements", () => {
  it("posts an improvement, updates the list and count, and clears the draft only on success", async () => {
    const created = improvement({ id: 6, body: "Fresh idea.", user: guest });
    serve(article(), guest, { "POST /api/v1/annotations/11/improvements": () => jsonResponse(created, 201) });
    renderPage("/articles/3/annotations/11");
    const field = await screen.findByRole("textbox", { name: "Add an improvement..." });
    await userEvent.type(field, "Fresh idea.");
    await userEvent.click(within(screen.getByTestId("annotation-panel")).getByRole("button", { name: "Post" }));

    expect(await screen.findByText("2 Annotation Improvements")).toBeInTheDocument();
    expect(within(screen.getByTestId("annotation-panel")).getAllByRole("listitem")).toHaveLength(2);
    expect(field).toHaveValue("");
  });

  it("lets only the author delete an improvement", async () => {
    serve(article(), guest, { "DELETE /api/v1/improvements/5": () => jsonResponse(undefined, 204) });
    renderPage("/articles/3/annotations/11");
    const panel = await screen.findByTestId("annotation-panel");
    const item = within(await within(panel).findByRole("listitem"));
    await userEvent.click(await item.findByRole("button", { name: "Delete" }));
    await waitFor(() => expect(screen.getByText("0 Annotation Improvements")).toBeInTheDocument());
  });

  it("shows an error when posting fails", async () => {
    serve(article(), guest, {
      "POST /api/v1/annotations/11/improvements": () =>
        jsonResponse({ error: { code: "validation_failed", message: "Body can't be blank", details: {} } }, 422),
    });
    renderPage("/articles/3/annotations/11");
    await userEvent.type(await screen.findByRole("textbox", { name: "Add an improvement..." }), "x");
    await userEvent.click(within(screen.getByTestId("annotation-panel")).getByRole("button", { name: "Post" }));
    expect(await screen.findByText("Body can't be blank")).toBeInTheDocument();
  });
});

describe("comments", () => {
  it("shows the count, the list with author, expertise and date, and no form for logged-out visitors", async () => {
    serve(article({ comments: [comment({ user: ada }), comment({ id: 10, body: "Second" })] }), null);
    renderPage();
    const section = await screen.findByTestId("comments");
    expect(within(section).getByRole("heading", { name: "2 Article Comments" })).toBeInTheDocument();
    expect(within(section).getByRole("link", { name: "ada" })).toHaveAttribute("href", "/users/8");
    expect(section).toHaveTextContent("Physicist");
    expect(section.querySelector("time")).toHaveAttribute("datetime", "2026-03-02T19:10:00.000Z");
    expect(await within(section).findByRole("link", { name: "Login to post a comment!" })).toHaveAttribute(
      "href",
      "/session/new",
    );
    expect(within(section).queryByRole("textbox")).toBeNull();
    expect(within(section).queryByRole("button")).toBeNull();
  });

  it("renders neither form nor prompt while /me loads", async () => {
    fetchMock.mockImplementation((input) =>
      urlOf(input) === "/api/v1/me" ? new Promise(() => undefined) : Promise.resolve(jsonResponse(article())),
    );
    renderPage();
    const section = await screen.findByTestId("comments");
    expect(within(section).queryByRole("textbox")).toBeNull();
    expect(within(section).queryByRole("link", { name: "Login to post a comment!" })).toBeNull();
  });

  it("treats a failed /me as logged out", async () => {
    fetchMock.mockImplementation((input) =>
      Promise.resolve(
        urlOf(input) === "/api/v1/me"
          ? jsonResponse({ error: { code: "unknown", message: "boom", details: {} } }, 500)
          : jsonResponse(article()),
      ),
    );
    renderPage();
    expect(await screen.findByRole("link", { name: "Login to post a comment!" }, { timeout: 4000 })).toBeInTheDocument();
  });

  it("posts a comment that appears immediately, and clears the draft only after success", async () => {
    const created = comment({ id: 10, body: "New one" });
    serve(article(), guest, { "POST /api/v1/articles/3/comments": () => jsonResponse(created, 201) });
    renderPage();
    const field = await screen.findByRole("textbox", { name: "Add a comment..." });
    await userEvent.type(field, "New one");
    await userEvent.click(screen.getByRole("button", { name: "Post" }));
    expect(await screen.findByText("2 Article Comments")).toBeInTheDocument();
    expect(screen.getByText("New one", { selector: "p" })).toBeInTheDocument();
    expect(field).toHaveValue("");
  });

  it("keeps the draft across a background refetch and across opening an annotation", async () => {
    serve(article(), guest);
    renderPage();
    const field = await screen.findByRole("textbox", { name: "Add a comment..." });
    await userEvent.type(field, "half typed");
    const articleCalls = () => fetchMock.mock.calls.filter(([url]) => urlOf(url) === "/api/v1/articles/3").length;
    const before = articleCalls();

    act(() => {
      window.dispatchEvent(new Event("focus"));
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await userEvent.click(screen.getByRole("link", { name: "Sunlight" }));
    await screen.findByText("Light from the sun.");

    expect(articleCalls()).toBeGreaterThanOrEqual(before);
    expect(screen.getByRole("textbox", { name: "Add a comment..." })).toHaveValue("half typed");
  });

  it("keeps the draft and shows the server message when posting fails", async () => {
    serve(article(), guest, {
      "POST /api/v1/articles/3/comments": () =>
        jsonResponse({ error: { code: "validation_failed", message: "Body is too long", details: {} } }, 422),
    });
    renderPage();
    const field = await screen.findByRole("textbox", { name: "Add a comment..." });
    await userEvent.type(field, "draft");
    await userEvent.click(screen.getByRole("button", { name: "Post" }));
    expect(await screen.findByText("Body is too long")).toBeInTheDocument();
    expect(field).toHaveValue("draft");
  });

  it("falls back to a generic message for non-API errors", async () => {
    fetchMock.mockImplementation((input, init) =>
      init?.method === "POST"
        ? Promise.reject(new TypeError("offline"))
        : Promise.resolve(jsonResponse(urlOf(input).endsWith("/me") ? { user: guest } : article())),
    );
    renderPage();
    await userEvent.type(await screen.findByRole("textbox", { name: "Add a comment..." }), "x");
    await userEvent.click(screen.getByRole("button", { name: "Post" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Could not reach the server");
  });

  it("lets only the owner delete a comment, after a confirm", async () => {
    serve(article({ comments: [comment(), comment({ id: 10, body: "Other", user: ada })] }), guest, {
      "DELETE /api/v1/comments/9": () => jsonResponse(undefined, 204),
    });
    renderPage();
    const section = await screen.findByTestId("comments");
    // Exactly one Delete (findByRole throws on several): the other comment is not the guest's.
    const button = await within(section).findByRole("button", { name: "Delete" });
    await userEvent.click(button);
    expect(confirmSpy).toHaveBeenCalledWith("Are you sure you want to delete your comment?");
    await waitFor(() => expect(screen.getByText("1 Article Comments")).toBeInTheDocument());
    expect(screen.queryByText("Great explanation!")).toBeNull();
  });

  it("shows an error when deleting fails", async () => {
    serve(article(), guest, {
      "DELETE /api/v1/comments/9": () =>
        jsonResponse({ error: { code: "not_found", message: "Not found", details: {} } }, 404),
    });
    renderPage();
    await userEvent.click(await screen.findByRole("button", { name: "Delete" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Not found");
  });
});
