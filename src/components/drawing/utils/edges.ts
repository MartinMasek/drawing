import type { Point } from "../types";

export function hitTestBoundsEdge(
  bounds: { left: number; top: number; right: number; bottom: number },
  point: Point,
  tolerance: number
): "left" | "right" | "top" | "bottom" | null {
  const { left, top, right, bottom } = bounds;
  const { x, y } = point;
  // Check vertical edges
  if (Math.abs(x - left) <= tolerance && y >= top - tolerance && y <= bottom + tolerance) return "left";
  if (Math.abs(x - right) <= tolerance && y >= top - tolerance && y <= bottom + tolerance) return "right";
  // Check horizontal edges
  if (Math.abs(y - top) <= tolerance && x >= left - tolerance && x <= right + tolerance) return "top";
  if (Math.abs(y - bottom) <= tolerance && x >= left - tolerance && x <= right + tolerance) return "bottom";
  return null;
}


