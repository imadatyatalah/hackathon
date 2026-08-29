"use client";

/* eslint-disable @next/next/no-img-element -- previews use arbitrary public URLs supplied by the user. */

import { FormEvent, useState } from "react";

const sizes = ["XS", "S", "M", "L", "XL", "XXL"] as const;
const garmentMeasurementFields = [
  { key: "chestCm", label: "Chest", placeholder: "e.g. 112" },
  { key: "lengthCm", label: "Length", placeholder: "e.g. 68" },
  { key: "shoulderCm", label: "Shoulder", placeholder: "e.g. 48" },
  { key: "sleeveCm", label: "Sleeve", placeholder: "e.g. 64" },
] as const;

type GarmentSize = (typeof sizes)[number];
type GarmentMeasurementKey = (typeof garmentMeasurementFields)[number]["key"];
type GarmentMeasurements = Record<GarmentMeasurementKey, string>;

const fakeProductSizeChart: Record<GarmentSize, GarmentMeasurements> = {
  XS: { chestCm: "102", lengthCm: "64", shoulderCm: "43", sleeveCm: "61" },
  S: { chestCm: "106", lengthCm: "66", shoulderCm: "44", sleeveCm: "62" },
  M: { chestCm: "110", lengthCm: "68", shoulderCm: "46", sleeveCm: "63" },
  L: { chestCm: "114", lengthCm: "70", shoulderCm: "48", sleeveCm: "64" },
  XL: { chestCm: "118", lengthCm: "72", shoulderCm: "50", sleeveCm: "65" },
  XXL: { chestCm: "122", lengthCm: "74", shoulderCm: "52", sleeveCm: "66" },
};

const fakeLookData = {
  modelPhotoUrl:
    "https://pub-711c9d58ffa34b57802b40087f83d91f.r2.dev/Male%20Model%20Full%20Image.jpg",
  garmentPhotoUrl:
    "https://pub-711c9d58ffa34b57802b40087f83d91f.r2.dev/Blouson%20Le%CC%81ger%20Noir.jpg",
  bodyChestCm: "102",
  bodyHeightCm: "182",
  bodyShoulderCm: "47",
  category: "jacket",
  referenceSize: "L" as const,
};

function hasCompleteMeasurements(
  measurements: GarmentMeasurements | undefined,
) {
  return garmentMeasurementFields.every(({ key }) => {
    const value = Number(measurements?.[key]);
    return Number.isFinite(value) && value > 0;
  });
}

type GenerationResult = {
  lookId: string;
  fitVerdict: string;
  recommendedSize: string;
  recommendedChestCm: number;
  imageDataUrl: string;
};

function isImageUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function LookGenerator() {
  const [modelPhotoUrl, setModelPhotoUrl] = useState("");
  const [garmentPhotoUrl, setGarmentPhotoUrl] = useState("");
  const [bodyChestCm, setBodyChestCm] = useState("");
  const [bodyHeightCm, setBodyHeightCm] = useState("");
  const [bodyShoulderCm, setBodyShoulderCm] = useState("");
  const [sizeChart, setSizeChart] = useState<
    Partial<Record<GarmentSize, GarmentMeasurements>>
  >({});
  const [referenceSize, setReferenceSize] = useState<GarmentSize | "">("");
  const [category, setCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerationResult | null>(null);

  const canPreviewModel = isImageUrl(modelPhotoUrl);
  const canPreviewGarment = isImageUrl(garmentPhotoUrl);
  const referenceMeasurements = referenceSize
    ? sizeChart[referenceSize]
    : undefined;

  function prefillWithFakeData() {
    setModelPhotoUrl(fakeLookData.modelPhotoUrl);
    setGarmentPhotoUrl(fakeLookData.garmentPhotoUrl);
    setBodyChestCm(fakeLookData.bodyChestCm);
    setBodyHeightCm(fakeLookData.bodyHeightCm);
    setBodyShoulderCm(fakeLookData.bodyShoulderCm);
    setSizeChart(fakeProductSizeChart);
    setReferenceSize(fakeLookData.referenceSize);
    setCategory(fakeLookData.category);
    setError(null);
    setResult(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!hasCompleteMeasurements(referenceMeasurements)) {
      setError(
        "Complete the selected reference size in the product size chart.",
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/looks/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelPhotoUrl,
          garmentPhotoUrl,
          bodyChestCm: Number(bodyChestCm),
          bodyHeightCm: Number(bodyHeightCm),
          bodyShoulderCm: Number(bodyShoulderCm),
          sizeChart: Object.fromEntries(
            sizes.flatMap((chartSize) => {
              const measurements = sizeChart[chartSize];

              return hasCompleteMeasurements(measurements)
                ? [
                    [
                      chartSize,
                      Object.fromEntries(
                        garmentMeasurementFields.map(({ key }) => [
                          key,
                          Number(measurements![key]),
                        ]),
                      ),
                    ],
                  ]
                : [];
            }),
          ),
          referenceSize,
          category,
        }),
      });
      const payload = (await response.json()) as
        | GenerationResult
        | { error?: string };

      if (!response.ok || !("lookId" in payload)) {
        setError(
          "error" in payload && payload.error
            ? payload.error
            : "Unable to generate this look.",
        );
        return;
      }

      setResult(payload);
    } catch {
      setError(
        "Could not reach the generator. Check your connection and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_70px_-42px_rgba(15,23,42,0.55)]">
      <div className="border-b border-slate-200 bg-slate-950 px-6 py-7 text-slate-50 sm:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-cyan-300">
              Virtual fitting room
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              See the garment on your model.
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Add two public image links and the garment details. The model
              image is locked; only its garment can change.
            </p>
          </div>
          <button
            className="rounded-full border border-cyan-300/50 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/20 focus:outline-none focus:ring-4 focus:ring-cyan-300/30 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSubmitting}
            onClick={prefillWithFakeData}
            type="button"
          >
            Prefill with fake data
          </button>
        </div>
      </div>

      <form className="p-6 sm:p-8" onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <ImageUrlField
            label="Model photo"
            value={modelPhotoUrl}
            onChange={setModelPhotoUrl}
            preview={canPreviewModel}
            emptyLabel="Model image"
          />
          <ImageUrlField
            label="Garment photo"
            value={garmentPhotoUrl}
            onChange={setGarmentPhotoUrl}
            preview={canPreviewGarment}
            emptyLabel="Garment image"
          />
        </div>

        <div className="mt-6 space-y-5 rounded-2xl bg-slate-100 p-5 sm:p-6">
          <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
            Model measurements
          </p>
          <label className="block text-sm font-medium text-slate-800">
            Chest measurement
            <span className="ml-1 text-slate-500">(cm)</span>
            <input
              className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none transition focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100"
              min="1"
              name="bodyChestCm"
              onChange={(event) => setBodyChestCm(event.target.value)}
              placeholder="e.g. 100"
              required
              type="number"
              value={bodyChestCm}
            />
          </label>

          <MeasurementField
            label="Height"
            name="bodyHeightCm"
            onChange={setBodyHeightCm}
            placeholder="e.g. 178"
            value={bodyHeightCm}
          />

          <MeasurementField
            label="Shoulder width"
            name="bodyShoulderCm"
            onChange={setBodyShoulderCm}
            placeholder="e.g. 44"
            value={bodyShoulderCm}
          />

          <div className="grid gap-5 border-t border-slate-300 pt-5 lg:grid-cols-[minmax(0,1fr)_minmax(17rem,0.55fr)]">
            <div className="min-w-0">
            <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Product size chart
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Add the garment’s actual dimensions for every available size. This
              is the source of truth for both the fit recommendation and image
              edit.
            </p>
            <div className="mt-3 overflow-x-auto rounded-xl border border-slate-300 bg-white">
              <table className="w-full min-w-[33rem] border-collapse text-left text-xs text-slate-700">
                <thead className="bg-slate-200 text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-slate-600">
                  <tr>
                    <th className="px-3 py-2.5" scope="col">
                      Size
                    </th>
                    {garmentMeasurementFields.map(({ label }) => (
                      <th className="px-2 py-2.5" key={label} scope="col">
                        {label} (cm)
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sizes.map((chartSize) => (
                    <tr className="border-t border-slate-200" key={chartSize}>
                      <th
                        className="px-3 py-2.5 font-mono font-semibold text-slate-900"
                        scope="row"
                      >
                        {chartSize}
                      </th>
                      {garmentMeasurementFields.map(
                        ({ key, label, placeholder }) => (
                          <td className="px-1.5 py-1.5" key={key}>
                            <input
                              aria-label={`${chartSize} ${label} in centimetres`}
                              className="block w-full min-w-0 rounded-lg border border-slate-300 px-2 py-2 text-sm font-medium text-slate-950 outline-none transition focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100"
                              min="1"
                              onChange={(event) =>
                                setSizeChart((current) => ({
                                  ...current,
                                  [chartSize]: {
                                    chestCm: "",
                                    lengthCm: "",
                                    shoulderCm: "",
                                    sleeveCm: "",
                                    ...current[chartSize],
                                    [key]: event.target.value,
                                  },
                                }))
                              }
                              placeholder={placeholder}
                              type="number"
                              value={sizeChart[chartSize]?.[key] ?? ""}
                            />
                          </td>
                        ),
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-t border-slate-300 pt-5 lg:border-t-0 lg:border-l lg:pl-5 lg:pt-0">
            <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Garment measurements
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Choose the product size represented by the garment photo. Its
              measurements come directly from the chart above.
            </p>
            <label className="mt-3 block text-sm font-medium text-slate-800">
              Reference garment size
              <select
                className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none transition focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100"
                onChange={(event) =>
                  setReferenceSize(event.target.value as GarmentSize | "")
                }
                required
                value={referenceSize}
              >
                <option value="">Choose a completed size</option>
                {sizes.map((chartSize) => (
                  <option
                    disabled={!hasCompleteMeasurements(sizeChart[chartSize])}
                    key={chartSize}
                    value={chartSize}
                  >
                    {chartSize}
                  </option>
                ))}
              </select>
            </label>
            {hasCompleteMeasurements(referenceMeasurements) ? (
              <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                {garmentMeasurementFields.map(({ key, label }) => (
                  <div className="rounded-lg bg-white px-3 py-2" key={key}>
                    <dt className="text-slate-500">{label}</dt>
                    <dd className="mt-0.5 font-semibold tabular-nums text-slate-900">
                      {referenceMeasurements![key]} cm
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}
            <label className="mt-5 block text-sm font-medium text-slate-800">
              Garment category
              <input
                className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none transition focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100"
                name="category"
                onChange={(event) => setCategory(event.target.value)}
                placeholder="e.g. jacket"
                required
                type="text"
                value={category}
              />
            </label>
          </div>
          </div>
        </div>

        <div className="mt-7 flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-sm leading-6 text-slate-600">
            Use clear, publicly accessible images. Exact model and garment
            dimensions anchor fit, seam placement, sleeve length, and hem
            length.
          </p>
          <button
            className="rounded-full bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-200 disabled:cursor-wait disabled:bg-slate-400"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Creating your look…" : "Generate look"}
          </button>
        </div>

        {error ? (
          <p
            aria-live="polite"
            className="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            {error}
          </p>
        ) : null}

        {result ? (
          <div
            aria-live="polite"
            className="mt-5 rounded-xl bg-cyan-50 px-4 py-4 text-sm text-cyan-950"
          >
            <p className="font-semibold">Your garment-only edit is ready.</p>
            <p className="mt-1">
              Recommended size:{" "}
              <span className="font-medium">{result.recommendedSize}</span>
              {" · "}
              {result.recommendedChestCm} cm chest · {result.fitVerdict}
            </p>
            <img
              alt="Generated garment-only try-on"
              className="mt-4 aspect-[2/3] w-full max-w-sm rounded-xl object-cover shadow-sm"
              src={result.imageDataUrl}
            />
            <p className="mt-1 break-all font-mono text-xs text-cyan-800">
              Look ID: {result.lookId}
            </p>
          </div>
        ) : null}
      </form>
    </section>
  );
}

function MeasurementField({
  label,
  name,
  onChange,
  placeholder,
  value,
}: {
  label: string;
  name: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <label className="block text-sm font-medium text-slate-800">
      {label}
      <span className="ml-1 text-slate-500">(cm)</span>
      <input
        className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none transition focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100"
        min="1"
        name={name}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required
        type="number"
        value={value}
      />
    </label>
  );
}

function ImageUrlField({
  label,
  value,
  onChange,
  preview,
  emptyLabel,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  preview: boolean;
  emptyLabel: string;
}) {
  return (
    <label className="block text-sm font-medium text-slate-800">
      <span className="sr-only">{label}</span>
      <input
        className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none transition focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100"
        inputMode="url"
        onChange={(event) => onChange(event.target.value)}
        placeholder="https://…"
        required
        type="url"
        value={value}
      />
      <span className="mt-3 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl bg-slate-100 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
        {preview ? (
          <img
            alt={`${label} preview`}
            className="h-full w-full object-cover"
            src={value}
          />
        ) : (
          emptyLabel
        )}
      </span>
    </label>
  );
}
