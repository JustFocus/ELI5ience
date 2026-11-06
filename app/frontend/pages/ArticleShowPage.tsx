import { useParams } from "react-router";

/**
 * PLACEHOLDER - Routes: /articles/:id and /articles/:id/annotations/:annotationId
 *
 * To build: article body with highlighted annotations, side panel (tooltip /
 * annotation + improvements / new-annotation form), comments. Use `useArticle(id)`
 * and the annotation, improvement and comment mutations from "~/queries".
 */
export function ArticleShowPage() {
  const { id, annotationId } = useParams();
  return (
    <div className="container">
      <h1>Article page (placeholder)</h1>
      <p>
        Article {id}
        {annotationId ? `, annotation ${annotationId}` : ""}. The article show page is not built yet.
      </p>
    </div>
  );
}
