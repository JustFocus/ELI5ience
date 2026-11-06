/** "Mar 2, 2026, 6:47 PM" in the viewer's locale and time zone. */
export function formatTimestamp(iso: string, locale?: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}
