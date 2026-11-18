import "server-only";
import { db } from "./db";
import { getConversation, getMessages, markRead, type Booking } from "./data";
import type { SessionUser } from "./auth";

export function loadThread(conversationId: number, user: SessionUser, afterId = 0) {
  const c = getConversation(conversationId);
  if (!c || (c.musician_user_id !== user.id && c.business_user_id !== user.id)) return null;
  const messages = getMessages(c.id, afterId);
  markRead(c.id, user.id);
  const bookings = db()
    .prepare(
      `SELECT bk.*, m.name AS musician_name, b.name AS business_name FROM bookings bk
       JOIN musicians m ON m.id = bk.musician_id JOIN businesses b ON b.id = bk.business_id
       WHERE bk.musician_id = ? AND bk.business_id = ? ORDER BY bk.event_date`,
    )
    .all(c.musician_id, c.business_id) as unknown as Booking[];
  return { conversation: c, messages, bookings };
}
