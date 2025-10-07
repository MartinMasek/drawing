import type { Point, RectShape } from "../types";

export type Bounds = Readonly<{ left: number; top: number; right: number; bottom: number }>;

export function getGroupRectsForRect(allRects: ReadonlyArray<RectShape>, rect: RectShape): ReadonlyArray<RectShape> {
  const gid = rect.groupId;
  if (!gid) return [rect];
  return allRects.filter((r) => r.groupId === gid);
}

export function collectGroups(rects: ReadonlyArray<RectShape>): Map<string, ReadonlyArray<RectShape>> {
  const byGroup = new Map<string, RectShape[]>();
  for (const r of rects) {
    const key = r.groupId ?? `single:${r.id}`;
    const arr = byGroup.get(key) ?? [];
    arr.push(r);
    byGroup.set(key, arr);
  }
  return new Map(Array.from(byGroup.entries()).map(([k, v]) => [k, v as ReadonlyArray<RectShape>]));
}

export function getBounds(rects: ReadonlyArray<RectShape>): Bounds {
  if (rects.length === 0) return { left: 0, top: 0, right: 0, bottom: 0 };
  let left = Number.POSITIVE_INFINITY;
  let top = Number.POSITIVE_INFINITY;
  let right = Number.NEGATIVE_INFINITY;
  let bottom = Number.NEGATIVE_INFINITY;
  for (const r of rects) {
    if (r.x < left) left = r.x;
    if (r.y < top) top = r.y;
    if (r.x + r.width > right) right = r.x + r.width;
    if (r.y + r.height > bottom) bottom = r.y + r.height;
  }
  return { left, top, right, bottom };
}
