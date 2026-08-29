/* eslint-disable @next/next/no-img-element -- generation and source images are stored as data URLs or user-supplied public URLs. */

import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { looks } from "@/db/schema";
import { auth } from "@/lib/auth";

type Measurements = {
  chestCm: number;
  lengthCm: number;
  shoulderCm: number;
  sleeveCm: number;
};

const measurementLabels: Array<[keyof Measurements, string]> = [
  ["chestCm", "Chest"],
  ["lengthCm", "Length"],
  ["shoulderCm", "Shoulder"],
  ["sleeveCm", "Sleeve"],
];

function formatCreatedAt(date: Date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function LookDetailsPage(props: PageProps<"/looks/[lookId]">) {
  const [{ lookId }, requestHeaders] = await Promise.all([
    props.params,
    headers(),
  ]);
  const session = await auth.api.getSession({ headers: requestHeaders });

  if (!session) {
    redirect("/");
  }

  const [look] = await db
    .select()
    .from(looks)
    .where(and(eq(looks.id, lookId), eq(looks.userId, session.user.id)))
    .limit(1);

  if (!look) {
    notFound();
  }

  const sizeChart = look.sizeChart as Record<string, Measurements>;
  const chartEntries = Object.entries(sizeChart);

  return (
    <main className="min-h-screen bg-[#edf2f5] px-4 py-5 text-slate-950 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-300/80 pb-5">
          <Link
            className="group inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-cyan-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-cyan-200"
            href="/"
          >
            <span aria-hidden="true" className="text-lg transition-transform group-hover:-translate-x-0.5">←</span>
            Atelier / Try-on
          </Link>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 font-mono text-[0.68rem] font-bold uppercase tracking-[0.14em] text-emerald-800">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {look.status}
          </span>
        </header>

        <div className="grid gap-8 py-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)] lg:py-12">
          <section>
            <p className="font-mono text-[0.7rem] font-bold uppercase tracking-[0.2em] text-cyan-700">
              Generation record
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.055em] text-slate-950 sm:text-6xl">
              Your {look.category.toLowerCase()} is ready to inspect.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              The original model has been preserved. This render applies the
              recommended size using the measurements provided for this run.
            </p>

            <figure className="relative mt-8 overflow-hidden rounded-[2rem] bg-slate-950 shadow-[0_28px_80px_-36px_rgba(15,23,42,0.8)]">
              <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-slate-950/70 to-transparent px-5 py-5 text-xs text-white/85 sm:px-7">
                <span className="font-mono uppercase tracking-[0.16em]">Rendered try-on</span>
                <span>{look.recommendedSize} / {look.fitVerdict}</span>
              </div>
              <img
                alt={`Generated try-on of a ${look.category}`}
                className="aspect-[3/4] w-full object-cover"
                src={look.imageDataUrl}
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 to-transparent px-5 pb-5 pt-12 text-sm text-white/90 sm:px-7 sm:pb-7">
                Garment-only edit · Source model remains unchanged
              </figcaption>
            </figure>
          </section>

          <aside className="space-y-5 lg:pt-10">
            <section className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_18px_50px_-34px_rgba(15,23,42,0.55)]">
              <div className="bg-slate-950 px-5 py-5 text-white">
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-cyan-300">Fit recommendation</p>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <p className="text-5xl font-semibold tracking-[-0.06em]">{look.recommendedSize}</p>
                  <p className="pb-1 text-sm text-slate-300">{look.fitVerdict}</p>
                </div>
              </div>
              <dl className="grid grid-cols-2 divide-x divide-slate-200">
                <div className="p-5">
                  <dt className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-slate-500">Garment chest</dt>
                  <dd className="mt-2 text-xl font-semibold tabular-nums">{look.recommendedChestCm} cm</dd>
                </div>
                <div className="p-5">
                  <dt className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-slate-500">Reference size</dt>
                  <dd className="mt-2 text-xl font-semibold">{look.referenceSize}</dd>
                </div>
              </dl>
            </section>

            <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_-34px_rgba(15,23,42,0.55)]">
              <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-slate-900">Model measurements</h2>
              <dl className="mt-4 grid grid-cols-3 gap-2">
                {[
                  ["Chest", look.bodyChestCm],
                  ["Height", look.bodyHeightCm],
                  ["Shoulder", look.bodyShoulderCm],
                ].map(([label, value]) => (
                  <div className="rounded-xl bg-slate-100 px-3 py-3" key={label}>
                    <dt className="text-xs text-slate-500">{label}</dt>
                    <dd className="mt-1 text-sm font-semibold tabular-nums">{value} cm</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_-34px_rgba(15,23,42,0.55)]">
              <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-slate-900">Product size chart</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[23rem] text-left text-xs">
                  <thead className="font-mono uppercase tracking-[0.08em] text-slate-500">
                    <tr>
                      <th className="pb-2 font-medium">Size</th>
                      {measurementLabels.map(([, label]) => <th className="pb-2 text-right font-medium" key={label}>{label}</th>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {chartEntries.map(([size, measurements]) => (
                      <tr key={size}>
                        <th className="py-2.5 font-semibold text-slate-950">{size.toUpperCase()}</th>
                        {measurementLabels.map(([key]) => <td className="py-2.5 text-right tabular-nums" key={key}>{measurements[key]} cm</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_-34px_rgba(15,23,42,0.55)]">
              <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-slate-900">Source material</h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {[
                  ["Model", look.modelPhotoUrl],
                  ["Garment", look.garmentPhotoUrl],
                ].map(([label, source]) => (
                  <figure className="overflow-hidden rounded-xl bg-slate-100" key={label}>
                    <img alt={`${label} source used for this generation`} className="aspect-[4/5] w-full object-cover" src={source} />
                    <figcaption className="px-3 py-2 text-xs font-semibold text-slate-700">{label}</figcaption>
                  </figure>
                ))}
              </div>
            </section>
          </aside>
        </div>

        <section className="border-t border-slate-300/80 py-7">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr] lg:gap-8">
            <div>
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-slate-500">Generation ID</p>
              <p className="mt-2 break-all font-mono text-xs leading-5 text-slate-700">{look.id}</p>
            </div>
            <div>
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-slate-500">Created</p>
              <p className="mt-2 text-sm font-medium text-slate-800">{formatCreatedAt(look.createdAt)}</p>
            </div>
            <Link className="self-end rounded-full bg-cyan-600 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-cyan-500 focus:outline-none focus-visible:ring-4 focus-visible:ring-cyan-200" href="/">
              Create another look
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
