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

/**
 * Adds a path for a rectangle with rounded corners (radii) or bevel clips to the given 2D context.
 * - Corner rendering rule matches OutlineLayer: radius arcs win only when radius > 0 and clip == 0, otherwise bevel.
 */
export function addRectPathWithCorners(ctx: CanvasRenderingContext2D, rect: RectShape): void {
  const o = getEffectiveCornerOffsets(rect);
  const radii = rect.radii ?? { "top-left": 0, "top-right": 0, "bottom-left": 0, "bottom-right": 0 };
  const clips = rect.clips ?? { "top-left": 0, "top-right": 0, "bottom-left": 0, "bottom-right": 0 };

  const x = rect.x; const y = rect.y; const w = rect.width; const h = rect.height;
  const tl = o["top-left"]; const tr = o["top-right"]; const bl = o["bottom-left"]; const br = o["bottom-right"];
  const rtl = radii["top-left"]; const rtr = radii["top-right"]; const rbl = radii["bottom-left"]; const rbr = radii["bottom-right"];
  const ctl = clips["top-left"]; const ctr = clips["top-right"]; const cbl = clips["bottom-left"]; const cbr = clips["bottom-right"];

  const arcTL = rtl > 0 && ctl === 0;
  const arcTR = rtr > 0 && ctr === 0;
  const arcBL = rbl > 0 && cbl === 0;
  const arcBR = rbr > 0 && cbr === 0;

  ctx.moveTo(x + (arcTL ? rtl : tl), y);
  // Top edge
  ctx.lineTo(x + w - (arcTR ? rtr : tr), y);
  // Top-right corner
  if (arcTR) { ctx.arc(x + w - rtr, y + rtr, rtr, -Math.PI / 2, 0); }
  else if (tr > 0) { ctx.lineTo(x + w, y + tr); }

  // Right edge
  ctx.lineTo(x + w, y + h - (arcBR ? rbr : br));
  // Bottom-right corner
  if (arcBR) { ctx.arc(x + w - rbr, y + h - rbr, rbr, 0, Math.PI / 2); }
  else if (br > 0) { ctx.lineTo(x + w - br, y + h); }

  // Bottom edge
  ctx.lineTo(x + (arcBL ? rbl : bl), y + h);
  // Bottom-left corner
  if (arcBL) { ctx.arc(x + rbl, y + h - rbl, rbl, Math.PI / 2, Math.PI); }
  else if (bl > 0) { ctx.lineTo(x, y + h - bl); }

  // Left edge
  ctx.lineTo(x, y + (arcTL ? rtl : tl));
  // Top-left corner
  if (arcTL) { ctx.arc(x + rtl, y + rtl, rtl, Math.PI, 1.5 * Math.PI); }
  else if (tl > 0) { ctx.lineTo(x + tl, y); }

  ctx.closePath();
}


