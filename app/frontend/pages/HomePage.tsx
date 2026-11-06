import { Link } from "react-router";
import { ArticleCard } from "~/components/ArticleCard";
import { ErrorState, LoadingState } from "~/components/StatusMessage";
import { useArticles } from "~/queries";

/** Route: / */
export function HomePage() {
  const articles = useArticles();

  return (
    <>
      <section className="jumbotron">
        <div className="container">
          <h1 className="jumbotron-title">Welcome to ELI5ience!</h1>
          <p className="jumbotron-subtitle">
            Annotate science-based articles with &quot;ELI5&quot; (Explain Like I&apos;m 5) breakdowns.
          </p>
          <Link className="btn btn-success btn-sm" to="/articles/new">
            Create article <span aria-hidden="true">&raquo;</span>
          </Link>
        </div>
      </section>

      <section className="container" aria-label="Articles">
        {articles.isPending && <LoadingState label="Loading articles..." />}
        {articles.isError && (
          <ErrorState
            title="Could not load articles"
            error={articles.error}
            onRetry={() => void articles.refetch()}
          />
        )}
        {articles.isSuccess &&
          (articles.data.articles.length === 0 ? (
            <p className="status-message">No articles yet. Be the first to create one!</p>
          ) : (
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-2 article-grid">
              {articles.data.articles.map((article) => (
                <div className="col" key={article.id}>
                  <ArticleCard article={article} />
                </div>
              ))}
            </div>
          ))}
      </section>
    </>
  );
}
