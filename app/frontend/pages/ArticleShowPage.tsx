import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { AnnotationPanel, type PendingSelection } from "~/components/annotations/AnnotationPanel";
import { ArticleBody } from "~/components/article/ArticleBody";
import { ArticleHeader } from "~/components/article/ArticleHeader";
import { CommentSection } from "~/components/comments/CommentSection";
import { ErrorState, LoadingState } from "~/components/StatusMessage";
import { checkSelection, rejectionMessage } from "~/lib/annotationOverlap";
import type { SelectionOffsets } from "~/lib/selectionOffsets";
import { useArticle } from "~/queries";
import type { Annotation } from "~/types/api";

/** The last text selection, tagged with the URL it was made on so navigating away drops it. */
interface TaggedPending {
  routeKey: string;
  value: PendingSelection;
}

/** Routes: /articles/:id and /articles/:id/annotations/:annotationId */
export function ArticleShowPage() {
  const params = useParams();
  const articleId = Number(params.id);
  const annotationId = params.annotationId === undefined ? null : Number(params.annotationId);
  const routeKey = `${params.id}/${params.annotationId ?? ""}`;
  const navigate = useNavigate();
  const article = useArticle(articleId);
  const [tagged, setTagged] = useState<TaggedPending | null>(null);
  const pending = tagged?.routeKey === routeKey ? tagged.value : null;

  if (article.isPending) {
    return (
      <div className="container art-page">
        <LoadingState label="Loading article..." />
      </div>
    );
  }
  if (article.isError) {
    return (
      <div className="container art-page">
        <ErrorState title="Could not load the article" error={article.error} onRetry={() => void article.refetch()} />
      </div>
    );
  }

  const data = article.data;
  const annotation = data.annotations.find((a) => a.id === annotationId);

  function handleSelect(selection: SelectionOffsets) {
    if (selection.status !== "ok") return;
    const check = checkSelection(data.body.length, data.annotations, selection.start, selection.length);
    setTagged({
      routeKey,
      value: check.valid
        ? { kind: "form", selection: { start: selection.start, length: selection.length, text: selection.text } }
        : { kind: "rejected", message: rejectionMessage(check.reason) },
    });
  }

  function handleCreated(created: Annotation) {
    setTagged(null);
    void navigate(`/articles/${data.id}/annotations/${created.id}`);
  }

  function handleDeleted() {
    setTagged(null);
    void navigate(`/articles/${data.id}`);
  }

  return (
    <div className="container art-page">
      <ArticleHeader article={data} />
      <div className="art-columns">
        <ArticleBody
          article={data}
          activeAnnotationId={annotation?.id ?? null}
          onSelect={handleSelect}
          onAnnotationClick={() => { setTagged(null); }}
        />
        <AnnotationPanel
          article={data}
          annotation={annotation}
          annotationRequested={annotationId !== null}
          pending={pending}
          onCreated={handleCreated}
          onDeleted={handleDeleted}
          onCancelForm={() => { setTagged(null); }}
        />
      </div>
      <CommentSection article={data} />
    </div>
  );
}
