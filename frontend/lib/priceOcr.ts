// Reads a price from a photo entirely in the browser (Tesseract.js, no server call,
// no paid AI API) — the image itself is never uploaded or stored anywhere; only the
// extracted number is handed back to the caller.

export interface DetectedPrice {
  value: string; // normalized, dot-decimal, ready for a <input type="number">
  raw: string; // the matched text as it appeared in the image, for display
}

/**
 * Finds the price-shaped number most likely to be "the" price in OCR'd text.
 * Looks for two-decimal-digit amounts (how virtually all price tags/receipts
 * print a value) and, among matches, picks the largest — on a price tag the
 * total/unit price is usually the largest number shown (bigger than a weight,
 * a code fragment, etc).
 */
export function extractPrice(text: string): DetectedPrice | null {
  const matches = text.match(/\d{1,3}(?:[.,]\d{3})*[.,]\d{2}/g);
  if (!matches || matches.length === 0) return null;

  let best: DetectedPrice | null = null;
  let bestValue = -Infinity;

  for (const raw of matches) {
    const lastComma = raw.lastIndexOf(",");
    const lastDot = raw.lastIndexOf(".");
    const decimalIndex = Math.max(lastComma, lastDot);
    const intPart = raw.slice(0, decimalIndex).replace(/[.,]/g, "");
    const decPart = raw.slice(decimalIndex + 1);
    const normalized = `${intPart}.${decPart}`;
    const numeric = Number(normalized);

    if (!isNaN(numeric) && numeric > bestValue) {
      bestValue = numeric;
      best = { value: normalized, raw };
    }
  }

  return best;
}

export async function recognizePriceFromImage(file: File | Blob): Promise<DetectedPrice | null> {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("eng");
  try {
    const {
      data: { text },
    } = await worker.recognize(file);
    return extractPrice(text);
  } finally {
    await worker.terminate();
  }
}
