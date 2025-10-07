import type { Point, RectShape } from "../types";

export function generateRandomRects(
  count: number,
  toScene: (p: Point) => Point,
  nextRectId: () => string,
  defaultEdgeColor: string,
  defaultCornerColor: string,
  stageWidth: number,
  stageHeight: number,
  minSize: number
): ReadonlyArray<RectShape> {
  return Array.from({ length: count }).map(() => {
    const containerPoint: Point = { x: Math.random() * stageWidth, y: Math.random() * stageHeight };
    const scenePoint = toScene(containerPoint);
    const rectWidth = Math.max(minSize, Math.round(Math.random() * 200));
    const rectHeight = Math.max(minSize, Math.round(Math.random() * 200));
    return {
      id: nextRectId(),
      x: scenePoint.x,
      y: scenePoint.y,
      width: rectWidth,
      height: rectHeight,
      edges: { left: defaultEdgeColor, right: defaultEdgeColor, top: defaultEdgeColor, bottom: defaultEdgeColor },
      corners: { 'top-left': defaultCornerColor, 'top-right': defaultCornerColor, 'bottom-left': defaultCornerColor, 'bottom-right': defaultCornerColor },
      clips: { 'top-left': 0, 'top-right': 0, 'bottom-left': 0, 'bottom-right': 0 },
    };
  });
}


