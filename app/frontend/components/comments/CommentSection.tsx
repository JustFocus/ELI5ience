import { AuthoredItem } from "~/components/article/AuthoredItem";
import { BodyForm, errorMessage } from "~/components/article/BodyForm";
import { useViewer } from "~/hooks/useViewer";
import { useCreateComment, useDeleteComment } from "~/queries";
import type { Article } from "~/types/api";

/** Comments below the article: count heading, form (or login prompt), list. */
export function CommentSection({ article }: { article: Article }) {
  const viewer = useViewer();
  const create = useCreateComment(article.id);
  const remove = useDeleteComment(article.id);
  const headingId = `comments-heading-${article.id}`;

  return (
    <section className="well comment-sec" aria-labelledby={headingId} data-testid="comments">
      <h2 id={headingId} className="panel-heading-small">
        {article.comments.length} Article Comments
      </h2>
      <BodyForm
        placeholder="Add a comment..."
        submitLabel="Post"
        loginPrompt="Login to post a comment!"
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
        {article.comments.map((comment) => (
          <AuthoredItem
            key={comment.id}
            user={comment.user}
            body={comment.body}
            createdAt={comment.created_at}
            canDelete={viewer.user?.id === comment.user.id}
            confirmMessage="Are you sure you want to delete your comment?"
            onDelete={() => { remove.mutate(comment.id); }}
            deleting={remove.isPending && remove.variables === comment.id}
          />
        ))}
      </ul>
    </section>
  );
}
