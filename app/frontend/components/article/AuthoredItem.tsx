import { Link } from "react-router";
import { formatTimestamp } from "~/lib/formatDate";
import type { User } from "~/types/api";

/** "Name - Expertise": the author link, with the expertise shown exactly once. */
export function Byline({ user }: { user: User }) {
  return (
    <>
      <strong>
        <Link to={`/users/${user.id}`}>{user.username}</Link>
      </strong>
      {user.expertise && <span className="byline-expertise"> - {user.expertise}</span>}
    </>
  );
}

interface AuthoredItemProps {
  user: User;
  body: string;
  createdAt: string;
  /** Show the owner-only Delete button. */
  canDelete: boolean;
  /** Text of the confirm dialog shown before deleting. */
  confirmMessage: string;
  onDelete: () => void;
  deleting?: boolean;
}

/** One comment or improvement: author, expertise, owner-only Delete, text and date. */
export function AuthoredItem({ user, body, createdAt, canDelete, confirmMessage, onDelete, deleting }: AuthoredItemProps) {
  return (
    <li className="authored-item">
      <div className="authored-item-head">
        <span>
          <Byline user={user} />
        </span>
        {canDelete && (
          <button
            type="button"
            className="btn btn-danger btn-sm"
            disabled={deleting}
            onClick={() => {
              if (window.confirm(confirmMessage)) onDelete();
            }}
          >
            Delete
          </button>
        )}
      </div>
      <p className="authored-item-body">{body}</p>
      <time className="authored-item-date" dateTime={createdAt}>
        {formatTimestamp(createdAt)}
      </time>
    </li>
  );
}
