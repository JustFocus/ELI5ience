import { Byline } from "~/components/article/AuthoredItem";
import { errorMessage } from "~/components/article/BodyForm";
import { useViewer } from "~/hooks/useViewer";
import { useDeleteAnnotation } from "~/queries";
import type { Annotation } from "~/types/api";
import { ImprovementSection } from "./ImprovementSection";

interface AnnotationDetailProps {
  annotation: Annotation;
  /** Called after the annotation was deleted on the server. */
  onDeleted: () => void;
}

/** A selected annotation: its text, author, owner-only Delete, and its improvements. */
export function AnnotationDetail({ annotation, onDeleted }: AnnotationDetailProps) {
  const viewer = useViewer();
  const remove = useDeleteAnnotation(annotation.article_id);
  const isOwner = viewer.user?.id === annotation.user.id;

  return (
    <div className="annotation-detail">
      <p className="annotation-text">{annotation.body}</p>
      <p className="annotation-by">
        By: <Byline user={annotation.user} />
        {isOwner && (
          <button
            type="button"
            className="btn btn-danger btn-sm"
            disabled={remove.isPending}
            onClick={() => {
              if (!window.confirm("Are you sure you want to delete your annotation?")) return;
              remove.mutate(annotation.id, { onSuccess: onDeleted });
            }}
          >
            Delete
          </button>
        )}
      </p>
      {remove.error != null && (
        <p className="form-error" role="alert">
          {errorMessage(remove.error)}
        </p>
      )}
      <ImprovementSection key={annotation.id} annotation={annotation} />
    </div>
  );
}
