"use client";

import { useActionState, useState } from "react";
import { Star } from "lucide-react";
import { reviewAction } from "@/app/actions";
import { cn } from "@/lib/utils";
import { FormMessage, SubmitButton } from "../ui/SubmitButton";

export function ReviewForm({ bookingId, name }: { bookingId: number; name: string }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [state, action] = useActionState(reviewAction, undefined);
  if (state?.ok) return <FormMessage state={state} />;
  if (!open) return <button onClick={() => setOpen(true)} className="btn-ghost btn-sm"><Star className="h-3.5 w-3.5" /> Leave a review</button>;
  return (
    <form action={action} className="mt-3 w-full space-y-3 rounded-xl border border-line bg-surface-2 p-4">
      <input type="hidden" name="booking_id" value={bookingId} />
      <input type="hidden" name="rating" value={rating} />
      <p className="text-sm font-semibold">How was {name}?</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <button type="button" key={i} onClick={() => setRating(i)} aria-label={`${i} stars`}>
            <Star className={cn("h-6 w-6", i <= rating ? "fill-flame text-flame" : "text-dim")} />
          </button>
        ))}
      </div>
      <textarea name="body" rows={3} required className="input" placeholder="Punctuality, sound, crowd reaction…" />
      <FormMessage state={state} />
      <div className="flex gap-2">
        <SubmitButton className="btn-sm">Publish review</SubmitButton>
        <button type="button" onClick={() => setOpen(false)} className="btn-quiet btn-sm">Cancel</button>
      </div>
    </form>
  );
}
