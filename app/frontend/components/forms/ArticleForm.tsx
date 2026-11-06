import { useId, useState, type SyntheticEvent } from "react";
import { Link } from "react-router";
import { LOGIN_PATH } from "~/queries";
import type { CreateArticleInput } from "~/types/api";
import { TextAreaField, TextField } from "./FormField";
import {
  type ArticleFormValues,
  type FieldMessages,
  validateArticle,
} from "./articleValidation";

const EMPTY_VALUES: ArticleFormValues = { title: "", body: "", imageLink: "" };

interface ArticleFormProps {
  /** null while the viewer's login state is loading. */
  signedIn: boolean | null;
  submitting: boolean;
  /** Field messages from a 422 response. */
  serverErrors: FieldMessages;
  onSubmit: (input: CreateArticleInput) => void;
}

/**
 * Title, body and optional image link for a new article. Keeps the typed values
 * across failed submits. Logged-out visitors get a login link instead of the
 * submit button.
 */
export function ArticleForm({ signedIn, submitting, serverErrors, onSubmit }: ArticleFormProps) {
  const idBase = useId();
  const [values, setValues] = useState<ArticleFormValues>(EMPTY_VALUES);
  // Set by a submit attempt that failed client-side. Once set, it is re-checked
  // on every edit so a message clears as soon as its field is fixed.
  const [clientErrors, setClientErrors] = useState<FieldMessages>({});

  const hasClientErrors = Object.keys(clientErrors).length > 0;
  const errors = hasClientErrors ? clientErrors : serverErrors;

  function updateField(field: keyof ArticleFormValues, value: string) {
    const next = { ...values, [field]: value };
    setValues(next);
    if (hasClientErrors) setClientErrors(validateArticle(next));
  }

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validateArticle(values);
    setClientErrors(found);
    if (Object.keys(found).length > 0) return;

    const imageLink = values.imageLink.trim();
    onSubmit({
      title: values.title.trim(),
      body: values.body.trim(),
      image_link: imageLink === "" ? null : imageLink,
    });
  }

  return (
    <form className="form-panel-body" onSubmit={handleSubmit} noValidate>
      <TextField
        id={`${idBase}-title`}
        name="title"
        label="Title"
        placeholder="Title"
        value={values.title}
        onChange={(event) => { updateField("title", event.target.value); }}
        error={errors.title}
        autoComplete="off"
      />

      <TextAreaField
        id={`${idBase}-body`}
        name="body"
        label="Body"
        placeholder="Body"
        rows={12}
        value={values.body}
        onChange={(event) => { updateField("body", event.target.value); }}
        error={errors.body}
      />

      <TextField
        id={`${idBase}-image-link`}
        name="image_link"
        label="Image link (optional)"
        type="url"
        placeholder="https://example.com/image.jpg"
        value={values.imageLink}
        onChange={(event) => { updateField("imageLink", event.target.value); }}
        error={errors.image_link}
        autoComplete="off"
      />

      <div className="form-actions">
        {signedIn === true && (
          <button type="submit" className="btn btn-success btn-sm" disabled={submitting}>
            Create article
          </button>
        )}
        {signedIn === false && (
          // Server-rendered login page, so a plain anchor and not a router Link.
          <a className="form-login-prompt" href={LOGIN_PATH}>
            Login to create an article!
          </a>
        )}
        <Link className="btn btn-outline-light btn-sm" to="/">
          Cancel
        </Link>
      </div>
    </form>
  );
}
