import { Link } from "react-router";

/** Fallback route. Rails only serves the shell for known paths, so this is reached through in-app navigation. */
export function NotFoundPage() {
  return (
    <div className="container status-message">
      <h1>Page not found</h1>
      <p>
        <Link to="/">Back to the article list</Link>
      </p>
    </div>
  );
}
