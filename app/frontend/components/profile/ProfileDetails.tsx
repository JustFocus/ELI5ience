import type { User } from "~/types/api";

/** "User Info" panel on the profile page: username and expertise. */
export function ProfileDetails({ user }: { user: User }) {
  return (
    <section className="profile-panel profile-panel-details" aria-labelledby="profile-details-title">
      <h1 id="profile-details-title" className="profile-panel-title">
        User Info:
      </h1>
      <ul className="profile-details">
        <li>
          <strong>Username:</strong> {user.username}
        </li>
        <li>
          <strong>Expertise:</strong> {user.expertise ?? "Not given"}
        </li>
      </ul>
    </section>
  );
}
