import { TIMEZONE } from "@/lib/constants";

export function formatNotificationDate(iso: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeZone: TIMEZONE,
  }).format(new Date(iso));
}
