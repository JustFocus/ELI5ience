import { useId, useState, type SubmitEvent } from "react";
import { ApiError } from "~/api";
import { useViewer } from "~/hooks/useViewer";
import { LOGIN_PATH } from "~/queries";

export const MAX_BODY_LENGTH = 2000;

interface BodyFormProps {
  /** Placeholder text, also the accessible name of the field. */
  placeholder: string;
  submitLabel: string;
  /** Shown instead of the form when nobody is logged in. */
  loginPrompt: string;
  /** Textarea instead of a single line input. */
  multiline?: boolean;
  /** Send the draft. The draft is cleared only if this resolves. */
  onSubmit: (body: string) => Promise<unknown>;
  isPending: boolean;
  /** The last failed attempt, shown inline (the server message for ApiErrors). */
  error: unknown;
  /** Optional extra control rendered next to the submit button. */
  children?: React.ReactNode;
}

export function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : "Something went wrong. Please try again.";
}

/**
 * Draft text field plus submit button, shared by comments, improvements and
 * annotations. The draft lives only in this component's state: background
 * refetches re-render it but never reset it, and it is cleared only after a
 * successful submit. Logged-out visitors get a login link and no field at all.
 */
export function BodyForm({
  placeholder,
  submitLabel,
  loginPrompt,
  multiline = false,
  onSubmit,
  isPending,
  error,
  children,
}: BodyFormProps) {
  const viewer = useViewer();
  const errorId = useId();
  const [draft, setDraft] = useState("");

  if (!viewer.ready) return null;
  if (!viewer.user) {
    return (
      <p className="login-prompt">
        <a href={LOGIN_PATH}>{loginPrompt}</a>
      </p>
    );
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await onSubmit(draft);
      setDraft("");
    } catch {
      // The failure is surfaced through the `error` prop; keep the draft.
    }
  }

  const fieldProps = {
    className: "form-control body-form-field",
    placeholder,
    "aria-label": placeholder,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? errorId : undefined,
    required: true,
    maxLength: MAX_BODY_LENGTH,
    value: draft,
  };

  return (
    <form className="body-form" onSubmit={(event) => void handleSubmit(event)}>
      {multiline ? (
        <textarea {...fieldProps} rows={3} onChange={(event) => { setDraft(event.target.value); }} />
      ) : (
        <input {...fieldProps} type="text" onChange={(event) => { setDraft(event.target.value); }} />
      )}
      {error != null && (
        <p id={errorId} className="form-error" role="alert">
          {errorMessage(error)}
        </p>
      )}
      <div className="body-form-actions">
        <button type="submit" className="btn btn-success btn-sm" disabled={isPending}>
          {submitLabel}
        </button>
        {children}
      </div>
    </form>
  );
}
