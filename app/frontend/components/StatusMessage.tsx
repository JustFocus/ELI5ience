import { ApiError } from "~/api";

/** Loading indicator for a page or section. Announced politely to screen readers. */
export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="status-message d-flex align-items-center gap-2" role="status">
      <span className="spinner-border spinner-border-sm" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

interface ErrorStateProps {
  /** What failed, e.g. "Could not load articles". */
  title: string;
  error: unknown;
  onRetry?: () => void;
}

/** Error panel for a failed query. Shows the server's message for ApiErrors. */
export function ErrorState({ title, error, onRetry }: ErrorStateProps) {
  const detail = error instanceof ApiError ? error.message : "Something went wrong.";
  return (
    <div className="alert alert-danger d-flex align-items-center justify-content-between gap-3" role="alert">
      <span>
        <strong>{title}.</strong> {detail}
      </span>
      {onRetry && (
        <button type="button" className="btn btn-sm btn-outline-light" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
