import { AuthoredItem } from "~/components/article/AuthoredItem";
import { BodyForm, errorMessage } from "~/components/article/BodyForm";
import { useViewer } from "~/hooks/useViewer";
import { useCreateImprovement, useDeleteImprovement } from "~/queries";
import type { Annotation } from "~/types/api";

/** Improvements of one annotation: count heading, form (or login prompt), list. */
export function ImprovementSection({ annotation }: { annotation: Annotation }) {
  const viewer = useViewer();
  const create = useCreateImprovement(annotation.article_id, annotation.id);
  const remove = useDeleteImprovement(annotation.article_id, annotation.id);
  const headingId = `improvements-heading-${annotation.id}`;

  return (
    <section className="improv-sec" aria-labelledby={headingId}>
      <h3 id={headingId} className="panel-heading-small">
        {annotation.improvements.length} Annotation Improvements
      </h3>
      <BodyForm
        placeholder="Add an improvement..."
        submitLabel="Post"
        loginPrompt="Login to suggest an improvement!"
        onSubmit={(body) => create.mutateAsync({ body })}
        isPending={create.isPending}
        error={create.error}
      />
      {remove.error != null && (
        <p className="form-error" role="alert">
          {errorMessage(remove.error)}
        </p>
      )}
      <ul className="authored-list">
        {annotation.improvements.map((improvement) => (
          <AuthoredItem
            key={improvement.id}
            user={improvement.user}
            body={improvement.body}
            createdAt={improvement.created_at}
            canDelete={viewer.user?.id === improvement.user.id}
            confirmMessage="Are you sure you want to delete your improvement?"
            onDelete={() => { remove.mutate(improvement.id); }}
            deleting={remove.isPending && remove.variables === improvement.id}
          />
        ))}
      </ul>
    </section>
  );
}
