import { useParams } from "react-router";
import { ApiError } from "~/api";
import { ProfileArticles } from "~/components/profile/ProfileArticles";
import { ProfileDetails } from "~/components/profile/ProfileDetails";
import { ErrorState, LoadingState } from "~/components/StatusMessage";
import { useDeleteArticle, useMe, useUser } from "~/queries";
import type { ArticleSummary, UserProfile } from "~/types/api";

/** Route: /users/:id */
export function UserProfilePage() {
  const { id } = useParams();
  const profile = useUser(Number(id));

  return (
    <div className="profile-page">
      {profile.isPending && <LoadingState label="Loading profile..." />}
      {profile.isError &&
        (profile.error instanceof ApiError && profile.error.status === 404 ? (
          <ErrorState
            title="User not found"
            error={new ApiError(404, "not_found", "No user has this id.")}
          />
        ) : (
          <ErrorState
            title="Could not load this profile"
            error={profile.error}
            onRetry={() => void profile.refetch()}
          />
        ))}
      {profile.isSuccess && <ProfileView profile={profile.data} />}
    </div>
  );
}

function ProfileView({ profile }: { profile: UserProfile }) {
  const me = useMe();
  const deleteArticle = useDeleteArticle();

  // Only the logged-in user whose id matches the profile owns its articles.
  // Hidden until the viewer is known, so owner controls never flash for others.
  const isOwner = me.data?.user?.id === profile.id;

  function handleDelete(article: ArticleSummary) {
    if (!window.confirm(`Delete "${article.title}"? Its annotations and comments will be deleted too.`)) return;
    // The mutation invalidates this profile, so the list refetches without the article.
    deleteArticle.mutate({ id: article.id, userId: profile.id });
  }

  return (
    <>
      <ProfileDetails user={profile} />

      {deleteArticle.isError && <ErrorState title="Could not delete the article" error={deleteArticle.error} />}

      <ProfileArticles
        username={profile.username}
        articles={profile.articles}
        isOwner={isOwner}
        deletingId={deleteArticle.isPending ? deleteArticle.variables.id : undefined}
        onDelete={handleDelete}
      />
    </>
  );
}
