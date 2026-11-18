"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions";
import { FormMessage, SubmitButton } from "../ui/SubmitButton";

export function LoginForm({ next }: { next: string }) {
  const [state, action] = useActionState(loginAction, undefined);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <label className="block">
        <span className="label">Email</span>
        <input name="email" type="email" required autoComplete="email" className="input" placeholder="you@example.com" />
      </label>
      <label className="block">
        <span className="label">Password</span>
        <input name="password" type="password" required autoComplete="current-password" className="input" placeholder="••••••••" />
      </label>
      <FormMessage state={state} />
      <SubmitButton className="btn-lg w-full" pendingText="Logging in…">Log in</SubmitButton>
    </form>
  );
}
