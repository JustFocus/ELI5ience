// Client-side mirror of the article limits in docs/api.md. The server stays
// authoritative (its 422 details are shown on the same fields); checking here
// only saves a round trip and gives the same messages before submitting.

export const TITLE_MAX = 200;
export const BODY_MAX = 50_000;
export const IMAGE_LINK_MAX = 2048;

export type ArticleField = "title" | "body" | "image_link";
export type FieldMessages = Partial<Record<ArticleField, string>>;

export interface ArticleFormValues {
  title: string;
  body: string;
  imageLink: string;
}

/** Length in Unicode codepoints, as the server counts (not UTF-16 units). */
export function codepointLength(text: string): number {
  return Array.from(text).length;
}

export function isHttpUrl(text: string): boolean {
  try {
    const url = new URL(text);
    return (url.protocol === "http:" || url.protocol === "https:") && url.hostname !== "";
  } catch {
    return false;
  }
}

/** Returns a message per invalid field; an empty object means the values can be submitted. */
export function validateArticle(values: ArticleFormValues): FieldMessages {
  const errors: FieldMessages = {};

  const title = values.title.trim();
  if (title === "") {
    errors.title = "Title is required.";
  } else if (codepointLength(title) > TITLE_MAX) {
    errors.title = `Title must be ${TITLE_MAX} characters or fewer.`;
  }

  const body = values.body.trim();
  if (body === "") {
    errors.body = "Body is required.";
  } else if (codepointLength(body) > BODY_MAX) {
    errors.body = `Body must be ${BODY_MAX.toLocaleString("en-US")} characters or fewer.`;
  }

  const imageLink = values.imageLink.trim();
  if (imageLink !== "" && (!isHttpUrl(imageLink) || codepointLength(imageLink) > IMAGE_LINK_MAX)) {
    errors.image_link = "Image link must be an http or https URL.";
  }

  return errors;
}
