import { Link } from "react-router";
import type { ArticleSummary } from "~/types/api";

export function commentCountLabel(count: number): string {
  return count === 1 ? "1 Comment" : `${count} Comments`;
}

/** Summary card used on the home page; reusable for the profile page article list. */
export function ArticleCard({ article }: { article: ArticleSummary }) {
  return (
    <article className="card article-card" aria-labelledby={`article-${article.id}-title`}>
      <div className="card-body">
        <h2 id={`article-${article.id}-title`} className="article-card-title text-truncate">{article.title}</h2>
        <p className="article-card-excerpt">{article.excerpt}</p>
        <p className="comment-count">{commentCountLabel(article.comments_count)}</p>
        <Link className="btn btn-primary btn-sm" to={`/articles/${article.id}`}>
          View article <span aria-hidden="true">&raquo;</span>
          <span className="visually-hidden">: {article.title}</span>
        </Link>
      </div>
    </article>
  );
}
