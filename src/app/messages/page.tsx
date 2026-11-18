import type { Metadata } from "next";
import Link from "next/link";
import { MessagesSquare } from "lucide-react";
import { requireViewer } from "@/lib/auth";
import { conversationsFor } from "@/lib/data";
import { loadThread } from "@/lib/conversation";
import { cn, timeAgo } from "@/lib/utils";
import { Photo } from "@/components/ui/Photo";
import { Chat } from "@/components/messages/Chat";

export const metadata: Metadata = { title: "Messages" };
export const dynamic = "force-dynamic";

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const v = await requireViewer("/messages");
  const { c } = await searchParams;
  const convos = conversationsFor(v.user, v.profileId);
  const selectedId = Number(c) || null;
  const thread = selectedId ? loadThread(selectedId, v.user) : null;
  const isM = v.role === "musician";

  return (
    <div className="container-x py-6">
      <div className="card grid h-[calc(100dvh-7.5rem)] min-h-[520px] overflow-hidden md:grid-cols-[320px_1fr]">
        {/* List */}
        <aside className={cn("min-h-0 flex-col border-r border-line", thread ? "hidden md:flex" : "flex")}>
          <div className="border-b border-line p-4">
            <h1 className="display text-2xl font-bold">Messages</h1>
            <p className="text-xs text-muted">{isM ? "Chat with venues & organisers" : "Chat with musicians"}</p>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {convos.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted">
                No conversations yet.{" "}
                <Link href={isM ? "/gigs" : "/musicians"} className="text-flame">{isM ? "Apply to a gig" : "Find a musician"}</Link> to get started.
              </div>
            ) : (
              convos.map((x) => (
                <Link
                  key={x.id}
                  href={`/messages?c=${x.id}`}
                  className={cn("flex items-center gap-3 border-b border-line px-4 py-3.5 transition hover:bg-white/[0.03]", x.id === selectedId && "bg-white/[0.05]")}
                >
                  <Photo src={x.other_avatar} alt={x.other_name} w={100} className="h-11 w-11 shrink-0 rounded-full" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className={cn("truncate text-sm", x.unread ? "font-bold" : "font-medium")}>{x.other_name}</p>
                      <span className="shrink-0 text-[10px] text-dim">{timeAgo(x.updated_at)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className={cn("truncate text-xs", x.unread ? "text-fg" : "text-muted")}>
                        {x.last_kind === "booking" ? "📅 " : ""}{x.last_body ?? "No messages yet"}
                      </p>
                      {x.unread > 0 && <span className="ml-auto grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-flame px-1.5 text-[10px] font-bold text-ink">{x.unread}</span>}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </aside>

        {/* Thread */}
        <section className={cn("min-h-0", thread ? "flex flex-col" : "hidden md:flex")}>
          {thread ? (
            <Chat
              key={thread.conversation.id}
              conversationId={thread.conversation.id}
              me={{ userId: v.user.id, role: v.role }}
              other={
                isM
                  ? { name: thread.conversation.business_name, avatar: thread.conversation.business_logo, href: `/venues/${thread.conversation.business_slug}`, sub: "Venue / organiser" }
                  : { name: thread.conversation.musician_name, avatar: thread.conversation.musician_avatar, href: `/musicians/${thread.conversation.musician_slug}`, sub: "Musician" }
              }
              initialMessages={thread.messages}
              initialBookings={thread.bookings}
            />
          ) : (
            <div className="m-auto max-w-sm p-8 text-center">
              <MessagesSquare className="mx-auto h-12 w-12 text-dim" />
              <h2 className="display mt-4 text-xl font-bold">{selectedId ? "Conversation not found" : "Select a conversation"}</h2>
              <p className="mt-2 text-sm text-muted">Negotiate prices, confirm bookings and share event details — all in one thread.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
