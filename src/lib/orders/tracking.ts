import type { ThailandPostEvent } from "@/lib/thailand-post";

export function latestTrackingEvent(events: ThailandPostEvent[]) {
  // Thailand Post returns events oldest first (the tracking page uses the same order).
  return events.at(-1) ?? null;
}

export function isDeliveredTrackingEvent(event: ThailandPostEvent | null) {
  return event?.status === "501" && event.deliveryStatus === "S";
}
