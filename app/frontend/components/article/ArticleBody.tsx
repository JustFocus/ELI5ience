import { Fragment, useMemo, useRef } from "react";
import { Link } from "react-router";
import { splitBody } from "~/lib/bodySegments";
import { rangeToOffsets, type SelectionOffsets } from "~/lib/selectionOffsets";
import type { Article, Id } from "~/types/api";

interface ArticleBodyProps {
  article: Article;
  activeAnnotationId: Id | null;
  /** Called on mouseup with the current selection measured against the body text. */
  onSelect: (selection: SelectionOffsets) => void;
  /** Called when a highlight link is activated (the router handles the navigation). */
  onAnnotationClick: () => void;
}

/**
 * The article text with annotated passages as links. The container holds nothing
 * but the body text (plain text and highlight links), so DOM Range offsets
 * relative to it are offsets into `article.body`.
 */
export function ArticleBody({ article, activeAnnotationId, onSelect, onAnnotationClick }: ArticleBodyProps) {
  const container = useRef<HTMLDivElement>(null);
  const segments = useMemo(() => splitBody(article.body, article.annotations), [article.body, article.annotations]);

  function handleMouseUp() {
    const selection = window.getSelection();
    if (!container.current || !selection || selection.rangeCount === 0) return;
    onSelect(rangeToOffsets(container.current, selection.getRangeAt(0)));
  }

  return (
    <div
      ref={container}
      className="well art-body"
      role="region"
      aria-label="Article body"
      data-testid="article-body"
      onMouseUp={handleMouseUp}
    >
      {segments.map((segment) =>
        segment.kind === "text" ? (
          <Fragment key={`t${segment.start}`}>{segment.text}</Fragment>
        ) : (
          <Link
            key={`a${segment.annotation.id}`}
            className="ann-link"
            to={`/articles/${article.id}/annotations/${segment.annotation.id}`}
            aria-current={segment.annotation.id === activeAnnotationId ? "true" : undefined}
            onClick={onAnnotationClick}
          >
            {segment.text}
          </Link>
        ),
      )}
    </div>
  );
}
