import { Link } from "react-router";
import type { Article } from "~/types/api";

/** Title box: title, submitter, their expertise, and the cover image when there is one. */
export function ArticleHeader({ article }: { article: Article }) {
  return (
    <header className="well art-details">
      <div className="art-details-text">
        <h1>{article.title}</h1>
        <p className="art-details-meta">
          <strong>Submitted by:</strong> <Link to={`/users/${article.user.id}`}>{article.user.username}</Link>
          {article.user.expertise && (
            <>
              <br />
              <strong>Expertise:</strong> {article.user.expertise}
            </>
          )}
        </p>
      </div>
      {article.image_link && (
        <img className="art-details-image" src={article.image_link} alt="" referrerPolicy="no-referrer" />
      )}
    </header>
  );
}
