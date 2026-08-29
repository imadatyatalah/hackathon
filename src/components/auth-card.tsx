"use client";

import { FormEvent, useState } from "react";

import { authClient } from "@/lib/auth-client";
import { LookGenerator } from "@/components/look-generator";

type Mode = "sign-in" | "sign-up";

export function AuthCard() {
  const [mode, setMode] = useState<Mode>("sign-in");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const { data: session, isPending: isLoadingSession } = authClient.useSession();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));
    const result =
      mode === "sign-up"
        ? await authClient.signUp.email({
            name: String(formData.get("name")),
            email,
            password,
          })
        : await authClient.signIn.email({ email, password });

    if (result.error) {
      setMessage(result.error.message ?? "Unable to continue. Please try again.");
    }

    setIsSubmitting(false);
  }

  async function handleSignOut() {
    setIsSubmitting(true);
    setMessage(null);
    const result = await authClient.signOut();

    if (result.error) {
      setMessage(result.error.message ?? "Unable to sign out. Please try again.");
    }

    setIsSubmitting(false);
  }

  if (isLoadingSession) {
    return <p className="text-sm text-[#d2e0d7]">Loading session…</p>;
  }

  if (session) {
    return (
      <div className="space-y-5 rounded-[1.5rem] bg-white p-5 text-slate-950 shadow-[0_18px_45px_-28px_rgba(0,0,0,0.7)]">
        <div className="flex flex-wrap items-center justify-between gap-3 px-1">
          <p className="text-sm text-slate-600">
            Signed in as <span className="font-semibold text-slate-950">{session.user.name}</span>
          </p>
          <button
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-950 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            onClick={handleSignOut}
            type="button"
          >
            {isSubmitting ? "Signing out…" : "Sign out"}
          </button>
        </div>
        <LookGenerator />
        {message ? <p className="text-sm text-rose-700">{message}</p> : null}
      </div>
    );
  }

  return (
    <section className="w-full max-w-md rounded-2xl border border-zinc-300 bg-white p-6 text-zinc-950 shadow-[0_18px_45px_-28px_rgba(0,0,0,0.7)]">
      <div className="flex rounded-lg bg-zinc-100 p-1">
        {(["sign-in", "sign-up"] as const).map((nextMode) => (
          <button
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition ${
              mode === nextMode
                ? "bg-white text-zinc-950 shadow-sm"
                : "text-zinc-600"
            }`}
            key={nextMode}
            onClick={() => {
              setMode(nextMode);
              setMessage(null);
            }}
            type="button"
          >
            {nextMode === "sign-in" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        {mode === "sign-up" ? (
          <label className="block text-sm font-medium">
            Name
            <input
              className="mt-1 w-full rounded-lg border border-zinc-500 bg-transparent px-3 py-2 outline-none focus:border-zinc-950 focus:ring-4 focus:ring-[#dce2d8]"
              name="name"
              required
              type="text"
            />
          </label>
        ) : null}
        <label className="block text-sm font-medium">
          Email
          <input
            autoComplete="email"
            className="mt-1 w-full rounded-lg border border-zinc-500 bg-transparent px-3 py-2 outline-none focus:border-zinc-950 focus:ring-4 focus:ring-[#dce2d8]"
            name="email"
            required
            type="email"
          />
        </label>
        <label className="block text-sm font-medium">
          Password
          <input
            autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
            className="mt-1 w-full rounded-lg border border-zinc-500 bg-transparent px-3 py-2 outline-none focus:border-zinc-950 focus:ring-4 focus:ring-[#dce2d8]"
            minLength={8}
            name="password"
            required
            type="password"
          />
        </label>
        <button
          className="w-full rounded-lg bg-[#17221f] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#2d4039] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting
            ? "Please wait…"
            : mode === "sign-in"
              ? "Sign in"
              : "Create account"}
        </button>
        {message ? <p className="text-sm text-red-600">{message}</p> : null}
      </form>
    </section>
  );
}
