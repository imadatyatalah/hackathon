import { AuthCard } from "@/components/auth-card";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f4f7fb] px-5 py-10 font-sans text-slate-950 sm:px-8 sm:py-16">
      <div className="mx-auto w-full max-w-6xl">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700">
          Atelier / Try-on
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">
          A better way to test the fit before you wear it.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
          Sign in, add a model image and a garment image, then create a virtual
          try-on with the right fit context.
        </p>
        <div className="mt-8">
          <AuthCard />
        </div>
      </div>
    </main>
  );
}
