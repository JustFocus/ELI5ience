import { useMe } from "~/queries";
import type { User } from "~/types/api";

/**
 * The logged-in user, if any. `ready` is false only while `/me` is loading, so
 * callers can avoid flashing a login prompt at someone who is logged in. A failed
 * `/me` request counts as logged out.
 */
export function useViewer(): { ready: boolean; user: User | null } {
  const me = useMe();
  return { ready: !me.isPending, user: me.data?.user ?? null };
}
