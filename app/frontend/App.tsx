import { Route, Routes } from "react-router";
import { ArticleFormPage } from "~/pages/ArticleFormPage";
import { ArticleShowPage } from "~/pages/ArticleShowPage";
import { HomePage } from "~/pages/HomePage";
import { NotFoundPage } from "~/pages/NotFoundPage";
import { UserProfilePage } from "~/pages/UserProfilePage";

/**
 * Client routes. Rails serves the SPA shell only for the paths listed in
 * config/routes.rb (explicit, no catch-all): keep the two lists in sync.
 */
export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/articles/new" element={<ArticleFormPage />} />
      <Route path="/articles/:id" element={<ArticleShowPage />} />
      <Route path="/articles/:id/annotations/:annotationId" element={<ArticleShowPage />} />
      <Route path="/users/:id" element={<UserProfilePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
