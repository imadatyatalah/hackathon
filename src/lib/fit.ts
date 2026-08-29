const sizeChestCm = {
  xs: 82,
  s: 90,
  m: 98,
  l: 106,
  xl: 114,
  xxl: 122,
} as const;

export type GarmentSize = keyof typeof sizeChestCm;

type FitLabel = "tight fit" | "regular fit" | "oversized fit";

const outerwearCategories = new Set([
  "coat",
  "jacket",
  "blazer",
  "outerwear",
]);

function normaliseSize(size: string): GarmentSize | null {
  const normalised = size.trim().toLowerCase().replace(/[^a-z]/g, "");

  return normalised in sizeChestCm ? (normalised as GarmentSize) : null;
}

export function isSupportedSize(size: string) {
  return normaliseSize(size) !== null;
}

/**
 * Produces wording the virtual try-on model can use to account for the garment's
 * actual chest ease rather than relying only on its labeled size.
 */
export function computeFitLabel(
  bodyChestCm: number,
  category: string,
  garmentChestCm: number,
): FitLabel {
  const chestEaseCm = garmentChestCm - bodyChestCm;
  const oversizedThresholdCm = outerwearCategories.has(
    category.trim().toLowerCase(),
  )
    ? 18
    : 12;

  if (chestEaseCm < 0) {
    return "tight fit";
  }

  if (chestEaseCm > oversizedThresholdCm) {
    return "oversized fit";
  }

  return "regular fit";
}

export function recommendSize({
  bodyChestCm,
  category,
  sizeChart,
}: {
  bodyChestCm: number;
  category: string;
  sizeChart: Partial<Record<GarmentSize, number>>;
}): { size: GarmentSize; chestCm: number; fitLabel: FitLabel } | null {
  const targetEaseCm = outerwearCategories.has(category.trim().toLowerCase())
    ? 12
    : 6;
  const candidates = Object.entries(sizeChart) as Array<[GarmentSize, number]>;

  if (candidates.length === 0) {
    return null;
  }

  const [size, chestCm] = candidates.reduce((best, candidate) => {
    const bestDistance = Math.abs(best[1] - bodyChestCm - targetEaseCm);
    const candidateDistance = Math.abs(
      candidate[1] - bodyChestCm - targetEaseCm,
    );

    return candidateDistance < bestDistance ? candidate : best;
  });

  return {
    size,
    chestCm,
    fitLabel: computeFitLabel(bodyChestCm, category, chestCm),
  };
}
