import { BodyForm } from "~/components/article/BodyForm";
import { useCreateAnnotation } from "~/queries";
import type { Annotation, Id } from "~/types/api";

export interface NewSelection {
  start: number;
  length: number;
  text: string;
}

interface AnnotationFormProps {
  articleId: Id;
  selection: NewSelection;
  onCreated: (annotation: Annotation) => void;
  onCancel: () => void;
}

/** New-annotation form for a validated selection. Logged-out visitors get a login prompt instead. */
export function AnnotationForm({ articleId, selection, onCreated, onCancel }: AnnotationFormProps) {
  const create = useCreateAnnotation(articleId);

  return (
    <div className="annotation-form">
      <p>
        <strong>Creating annotation for:</strong>
      </p>
      <blockquote className="selected-text">
        <em>&quot;{selection.text}&quot;</em>
      </blockquote>
      <BodyForm
        key={`${selection.start}:${selection.length}`}
        placeholder="Add annotation..."
        submitLabel="Create annotation"
        loginPrompt="Login to create an annotation!"
        multiline
        onSubmit={async (body) => {
          const annotation = await create.mutateAsync({
            selection_start: selection.start,
            selection_length: selection.length,
            body,
          });
          onCreated(annotation);
        }}
        isPending={create.isPending}
        error={create.error}
      >
        <button type="button" className="btn btn-outline-light btn-sm" onClick={onCancel}>
          Cancel
        </button>
      </BodyForm>
    </div>
  );
}
