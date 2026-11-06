import { useNavigate } from "react-router";
import { ApiError } from "~/api";
import { ArticleForm } from "~/components/forms/ArticleForm";
import type { ArticleField, FieldMessages } from "~/components/forms/articleValidation";
import { ErrorState, LoadingState } from "~/components/StatusMessage";
import { useCreateArticle, useMe } from "~/queries";

const ARTICLE_FIELDS: readonly ArticleField[] = ["title", "body", "image_link"];

/** Maps the 422 details (keyed by request body keys) onto the form's fields. */
function fieldMessagesFrom(error: unknown): FieldMessages {
  if (!(error instanceof ApiError) || error.status !== 422) return {};
  const messages: FieldMessages = {};
  for (const field of ARTICLE_FIELDS) {
    const detail = error.details[field];
    if (detail && detail.length > 0) messages[field] = detail.join(" ");
  }
  return messages;
}

/** Route: /articles/new */
export function ArticleFormPage() {
  const navigate = useNavigate();
  const me = useMe();
  const createArticle = useCreateArticle();

  const serverErrors = fieldMessagesFrom(createArticle.error);
  // A 422 with no field we show is not attributable to a field: report it as a whole-form error.
  const formError = createArticle.error && Object.keys(serverErrors).length === 0 ? createArticle.error : null;

  return (
    <div className="form-page">
      <section className="form-panel" aria-labelledby="article-form-title">
        <h1 id="article-form-title" className="form-panel-title">
          Create An Article!
        </h1>

        {me.isPending && <LoadingState label="Checking your login..." />}
        {me.isError && (
          <ErrorState title="Could not check your login" error={me.error} onRetry={() => void me.refetch()} />
        )}

        {me.isSuccess && (
          <>
            {formError && <ErrorState title="Could not create the article" error={formError} />}
            <ArticleForm
              signedIn={me.data.user !== null}
              submitting={createArticle.isPending}
              serverErrors={serverErrors}
              onSubmit={(input) => {
                createArticle.mutate(input, {
                  onSuccess: (article) => {
                    void navigate(`/articles/${article.id}`);
                  },
                });
              }}
            />
          </>
        )}
      </section>
    </div>
  );
}
