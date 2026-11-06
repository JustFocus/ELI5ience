import { Link } from "react-router";
import type { Annotation, Article } from "~/types/api";
import { AnnotationDetail } from "./AnnotationDetail";
import { AnnotationForm, type NewSelection } from "./AnnotationForm";

/** What the last text selection in the body produced. */
export type PendingSelection =
  | { kind: "form"; selection: NewSelection }
  | { kind: "rejected"; message: string };

interface AnnotationPanelProps {
  article: Article;
  /** The annotation named by the URL, if it exists in this article. */
  annotation: Annotation | undefined;
  /** True when the URL names an annotation id (found or not). */
  annotationRequested: boolean;
  pending: PendingSelection | null;
  onCreated: (annotation: Annotation) => void;
  onDeleted: () => void;
  onCancelForm: () => void;
}

/**
 * Right hand panel. The new-annotation form wins while a valid selection is
 * pending; otherwise the URL's annotation, otherwise the hint. A rejected
 * selection shows its message above whichever of those is visible.
 */
export function AnnotationPanel({
  article,
  annotation,
  annotationRequested,
  pending,
  onCreated,
  onDeleted,
  onCancelForm,
}: AnnotationPanelProps) {
  let content;
  if (pending?.kind === "form") {
    content = (
      <AnnotationForm
        articleId={article.id}
        selection={pending.selection}
        onCreated={onCreated}
        onCancel={onCancelForm}
      />
    );
  } else {
    content = (
      <>
        {pending?.kind === "rejected" && (
          <p className="panel-notice" role="status">
            {pending.message}
          </p>
        )}
        {annotation ? (
          <AnnotationDetail annotation={annotation} onDeleted={onDeleted} />
        ) : (
          <>
            {annotationRequested && (
              <p className="panel-notice" role="status">
                That annotation no longer exists. <Link to={`/articles/${article.id}`}>Back to the article</Link>
              </p>
            )}
            <p className="panel-hint">
              <strong>Select text to create an annotation, or click a highlighted link to display one</strong>
            </p>
          </>
        )}
      </>
    );
  }

  return (
    <aside className="well art-panel" aria-label="Annotation" data-testid="annotation-panel">
      {content}
    </aside>
  );
}
