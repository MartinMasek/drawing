import type { RectShape } from "../types";

export type CornerKey = "top-left" | "top-right" | "bottom-left" | "bottom-right";

export function clampCornerValue(value: number, width: number, height: number): number {
  const limit = Math.min(width, height);
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(value, limit));
}

export function getEffectiveCornerOffsets(rect: RectShape): Record<CornerKey, number> {
  const clips = rect.clips ?? { "top-left": 0, "top-right": 0, "bottom-left": 0, "bottom-right": 0 };
  const radii = rect.radii ?? { "top-left": 0, "top-right": 0, "bottom-left": 0, "bottom-right": 0 };
  const tl = Math.max(clips["top-left"], radii["top-left"]);
  const tr = Math.max(clips["top-right"], radii["top-right"]);
  const bl = Math.max(clips["bottom-left"], radii["bottom-left"]);
  const br = Math.max(clips["bottom-right"], radii["bottom-right"]);
  return {
    "top-left": clampCornerValue(tl, rect.width, rect.height),
    "top-right": clampCornerValue(tr, rect.width, rect.height),
    "bottom-left": clampCornerValue(bl, rect.width, rect.height),
    "bottom-right": clampCornerValue(br, rect.width, rect.height),
  };
}

/**
 * Returns a simple polygon (no arcs) approximating the outline with bevels only.
 * Useful for overlays and hit visuals where we just need an outline path.
 */
export function outlinePointsWithBevels(rect: RectShape): number[] {
  const o = getEffectiveCornerOffsets(rect);
  const x = rect.x;
  const y = rect.y;
  const w = rect.width;
  const h = rect.height;
  return [
    x + o["top-left"], y,
    x + w - o["top-right"], y,
    x + w, y + o["top-right"],
    x + w, y + h - o["bottom-right"],
    x + w - o["bottom-right"], y + h,
    x + o["bottom-left"], y + h,
    x, y + h - o["bottom-left"],
    x, y + o["top-left"],
    x + o["top-left"], y,
  ];
}


