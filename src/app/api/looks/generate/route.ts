import { randomUUID } from "node:crypto";

import { db } from "@/db";
import { looks } from "@/db/schema";
import { auth } from "@/lib/auth";
import {
  computeFitLabel,
  isSupportedSize,
  recommendSize,
  type GarmentSize,
} from "@/lib/fit";

type GenerateLookRequest = {
  modelPhotoUrl?: unknown;
  garmentPhotoUrl?: unknown;
  bodyChestCm?: unknown;
  bodyHeightCm?: unknown;
  bodyShoulderCm?: unknown;
  sizeChart?: unknown;
  referenceSize?: unknown;
  category?: unknown;
};

type GarmentMeasurements = {
  chestCm: number;
  lengthCm: number;
  shoulderCm: number;
  sleeveCm: number;
};

type ProductSizeChart = Partial<Record<GarmentSize, GarmentMeasurements>>;

type OpenAIImageResponse = {
  data?: Array<{
    b64_json?: unknown;
  }>;
};

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

function isHttpUrl(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isPositiveNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

async function downloadImage(url: string, filename: string): Promise<Blob> {
  const response = await fetch(url, {
    redirect: "error",
    signal: AbortSignal.timeout(20_000),
  });

  const contentType = response.headers.get("content-type")?.split(";")[0];
  const contentLength = Number(response.headers.get("content-length"));

  if (
    !response.ok ||
    !contentType?.startsWith("image/") ||
    (Number.isFinite(contentLength) && contentLength > MAX_IMAGE_BYTES)
  ) {
    throw new Error(`Unable to download ${filename}`);
  }

  const image = await response.blob();

  if (image.size > MAX_IMAGE_BYTES) {
    throw new Error(`${filename} is too large`);
  }

  return image;
}

function createGarmentOnlyPrompt({
  bodyChestCm,
  bodyHeightCm,
  bodyShoulderCm,
  garmentChestCm,
  garmentLengthCm,
  garmentShoulderCm,
  garmentSleeveCm,
  recommendedSize,
  recommendedChestCm,
  referenceSize,
  category,
  fitLabel,
}: {
  bodyChestCm: number;
  bodyHeightCm: number;
  bodyShoulderCm: number;
  garmentChestCm: number;
  garmentLengthCm: number;
  garmentShoulderCm: number;
  garmentSleeveCm: number;
  recommendedSize: GarmentSize;
  recommendedChestCm: number;
  referenceSize: GarmentSize;
  category: string;
  fitLabel: ReturnType<typeof computeFitLabel>;
}) {
  return `Perform a garment-only virtual try-on using the two reference images.

Reference image 1 is the immutable source image. Change only pixels belonging to the existing garment silhouette. Every other pixel must remain identical to reference image 1, including the person’s identity, face, skin tone, body shape, anatomy, hair, pose, expression, crop, camera angle, lighting, background, and every non-garment detail. Do not retouch, restyle, add, remove, or alter the person or scene.

Reference image 2 is the garment reference. Replace only the model’s current garment with that exact ${category.trim()}. Preserve the garment’s color, material, cut, pattern, logo, seams, fastenings, and overall proportions from the garment reference.

Measurement specification — treat every number below as a binding physical dimension, not a loose suggestion:
• Model: ${bodyHeightCm} cm height, ${bodyChestCm} cm chest circumference, ${bodyShoulderCm} cm shoulder width.
• Garment reference: product size ${referenceSize.toUpperCase()}, ${garmentChestCm} cm chest circumference, ${garmentLengthCm} cm body length, ${garmentShoulderCm} cm shoulder width, ${garmentSleeveCm} cm sleeve length.
• Deterministically recommended size: ${recommendedSize.toUpperCase()}, with a ${recommendedChestCm} cm chest circumference and ${fitLabel}.

Render the recommended size. Fit the garment to the model using these exact relationships. Match the recommended chest circumference around the torso; place its shoulder seams at the model’s shoulders according to the specified widths; set the hem according to the stated garment length and model height; and set sleeves to the specified length on the model’s arms. Preserve garment ease and drape consistent with the stated ${fitLabel}. Do not compensate for any mismatch by changing the model’s body, pose, crop, camera perspective, or any pixels outside the garment. Return one photorealistic edited image.`;
}

function parseSizeChart(
  value: unknown,
): ProductSizeChart | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const sizeChart: ProductSizeChart = {};

  for (const [size, measurements] of Object.entries(value)) {
    if (
      !isSupportedSize(size) ||
      !measurements ||
      typeof measurements !== "object" ||
      Array.isArray(measurements)
    ) {
      return null;
    }

    const { chestCm, lengthCm, shoulderCm, sleeveCm } = measurements as Record<
      string,
      unknown
    >;

    if (
      !isPositiveNumber(chestCm) ||
      !isPositiveNumber(lengthCm) ||
      !isPositiveNumber(shoulderCm) ||
      !isPositiveNumber(sleeveCm)
    ) {
      return null;
    }

    sizeChart[
      size.trim().toLowerCase().replace(/[^a-z]/g, "") as GarmentSize
    ] = { chestCm, lengthCm, shoulderCm, sleeveCm };
  }

  return Object.keys(sizeChart).length > 0 ? sizeChart : null;
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return Response.json(
      { error: "Sign in before generating a look." },
      { status: 401 },
    );
  }

  let body: GenerateLookRequest;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const {
    modelPhotoUrl,
    garmentPhotoUrl,
    bodyChestCm,
    bodyHeightCm,
    bodyShoulderCm,
    sizeChart: rawSizeChart,
    referenceSize,
    category,
  } = body;

  if (
    !isHttpUrl(modelPhotoUrl) ||
    !isHttpUrl(garmentPhotoUrl) ||
    !isPositiveNumber(bodyChestCm) ||
    !isPositiveNumber(bodyHeightCm) ||
    !isPositiveNumber(bodyShoulderCm) ||
    !isNonEmptyString(category) ||
    !isNonEmptyString(referenceSize)
  ) {
    return Response.json(
      {
        error:
          "Both image URLs must be HTTP(S); model measurements, category, and a reference garment size must be provided.",
      },
      { status: 400 },
    );
  }

  const sizeChart = parseSizeChart(rawSizeChart);

  if (!sizeChart) {
    return Response.json(
      { error: "Complete at least one product size in the size chart." },
      { status: 400 },
    );
  }

  if (!isSupportedSize(referenceSize)) {
    return Response.json(
      { error: "referenceSize must be one of XS, S, M, L, XL, or XXL." },
      { status: 400 },
    );
  }

  const referenceSizeKey = referenceSize
    .trim()
    .toLowerCase()
    .replace(/[^a-z]/g, "") as GarmentSize;
  const referenceMeasurements = sizeChart[referenceSizeKey];

  if (!referenceMeasurements) {
    return Response.json(
      { error: "Complete the selected reference size in the product size chart." },
      { status: 400 },
    );
  }

  const recommendationSizeChart: Partial<Record<GarmentSize, number>> = {};
  for (const [size, measurements] of Object.entries(sizeChart) as Array<
    [GarmentSize, GarmentMeasurements]
  >) {
    recommendationSizeChart[size] = measurements.chestCm;
  }

  const recommendation = recommendSize({
    bodyChestCm,
    category,
    sizeChart: recommendationSizeChart,
  });

  if (!recommendation) {
    return Response.json(
      { error: "Unable to calculate a size recommendation." },
      { status: 400 },
    );
  }

  const {
    size: recommendedSize,
    chestCm: recommendedChestCm,
    fitLabel,
  } = recommendation;

  const apiToken = process.env.OPENAI_API_KEY;

  if (!apiToken) {
    return Response.json(
      { error: "OpenAI image generation is not configured." },
      { status: 500 },
    );
  }

  let imageResponse: OpenAIImageResponse;
  let providerRequestId: string;

  try {
    const [modelImage, garmentImage] = await Promise.all([
      downloadImage(modelPhotoUrl, "model image"),
      downloadImage(garmentPhotoUrl, "garment image"),
    ]);
    const formData = new FormData();

    formData.set("model", "gpt-image-2");
    formData.set(
      "prompt",
      createGarmentOnlyPrompt({
        bodyChestCm,
        bodyHeightCm,
        bodyShoulderCm,
        garmentChestCm: referenceMeasurements.chestCm,
        garmentLengthCm: referenceMeasurements.lengthCm,
        garmentShoulderCm: referenceMeasurements.shoulderCm,
        garmentSleeveCm: referenceMeasurements.sleeveCm,
        recommendedSize,
        recommendedChestCm,
        referenceSize: referenceSizeKey,
        category,
        fitLabel,
      }),
    );
    formData.set("quality", "high");
    formData.append("image[]", modelImage, "model-image");
    formData.append("image[]", garmentImage, "garment-image");

    const response = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      return Response.json(
        { error: "Unable to create the garment-only image edit." },
        { status: 502 },
      );
    }

    imageResponse = (await response.json()) as OpenAIImageResponse;
    providerRequestId = response.headers.get("x-request-id") ?? randomUUID();
  } catch {
    return Response.json(
      {
        error:
          "Unable to reach OpenAI or download one of the reference images.",
      },
      { status: 502 },
    );
  }

  const imageBase64 = imageResponse.data?.[0]?.b64_json;

  if (!isNonEmptyString(imageBase64)) {
    return Response.json(
      { error: "OpenAI did not return an edited image." },
      { status: 502 },
    );
  }

  const [look] = await db
    .insert(looks)
    .values({
      id: randomUUID(),
      userId: session.user.id,
      modelPhotoUrl,
      garmentPhotoUrl,
      imageDataUrl: `data:image/png;base64,${imageBase64}`,
      providerRequestId,
      fitVerdict: fitLabel,
      category: category.trim(),
      bodyChestCm,
      bodyHeightCm,
      bodyShoulderCm,
      referenceSize: referenceSizeKey.toUpperCase(),
      recommendedSize: recommendedSize.toUpperCase(),
      recommendedChestCm,
      sizeChart,
      status: "completed",
    })
    .returning({ id: looks.id });

  return Response.json({
    lookId: look.id,
    fitVerdict: fitLabel,
    recommendedSize: recommendedSize.toUpperCase(),
    recommendedChestCm,
  });
}
