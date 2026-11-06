import { useParams } from "react-router";

/**
 * PLACEHOLDER - Route: /users/:id
 *
 * To build: username, expertise and that user's articles (`useUser(id)`,
 * `ArticleCard`); the owner (`useMe`) sees "Create article" and delete controls
 * (`useDeleteArticle`).
 */
export function UserProfilePage() {
  const { id } = useParams();
  return (
    <div className="container">
      <h1>User profile (placeholder)</h1>
      <p>User {id}. The profile page is not built yet.</p>
    </div>
  );
}
