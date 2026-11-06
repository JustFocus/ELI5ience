import { Link } from "react-router";
import type { ArticleSummary, Id } from "~/types/api";

interface ProfileArticlesProps {
  username: string;
  articles: ArticleSummary[];
  /** The viewer owns this profile: show "Create article" and a Delete button per article. */
  isOwner: boolean;
  /** Article whose delete request is in flight. */
  deletingId?: Id;
  onDelete: (article: ArticleSummary) => void;
}

/** "<username>'s Articles" panel: a compact list of titles, as on the legacy profile. */
export function ProfileArticles({ username, articles, isOwner, deletingId, onDelete }: ProfileArticlesProps) {
  return (
    <section className="profile-panel" aria-labelledby="profile-articles-title">
      <h2 id="profile-articles-title" className="profile-panel-title">
        {`${username}'s Articles:`}
      </h2>
      <div className="profile-panel-body">
        {isOwner && (
          <div className="profile-actions">
            <Link className="btn btn-success btn-sm" to="/articles/new">
              Create article
            </Link>
          </div>
        )}

        {articles.length === 0 ? (
          <p className="profile-empty">No articles yet.</p>
        ) : (
          <ul className="profile-article-list">
            {articles.map((article) => (
              <li key={article.id}>
                <div className="profile-article-row">
                  <Link to={`/articles/${article.id}`}>{article.title}</Link>
                  {isOwner && (
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      disabled={deletingId === article.id}
                      onClick={() => { onDelete(article); }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
