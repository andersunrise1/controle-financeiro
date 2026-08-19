// Interpolates a color along the app's standard "pôr do sol" gradient
// (#ffd93d -> #ff8c42 at 45% -> #d6249f), the same stops used by the
// logo, YearlyChart's bar and CATEGORIES' flat colors.
const STOPS: [number, [number, number, number]][] = [
  [0, [255, 217, 61]], // #ffd93d
  [0.45, [255, 140, 66]], // #ff8c42
  [1, [214, 36, 159]], // #d6249f
];

function toHex(channel: number): string {
  return Math.round(channel).toString(16).padStart(2, "0");
}

export function sunsetColorAt(t: number): string {
  const clamped = Math.max(0, Math.min(1, t));

  for (let i = 0; i < STOPS.length - 1; i++) {
    const [t0, c0] = STOPS[i];
    const [t1, c1] = STOPS[i + 1];
    if (clamped >= t0 && clamped <= t1) {
      const local = (clamped - t0) / (t1 - t0);
      const r = c0[0] + (c1[0] - c0[0]) * local;
      const g = c0[1] + (c1[1] - c0[1]) * local;
      const b = c0[2] + (c1[2] - c0[2]) * local;
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }
  }

  return "#d6249f";
}
