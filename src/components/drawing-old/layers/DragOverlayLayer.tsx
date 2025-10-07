import { Layer, Rect, Line } from "react-konva";
import type { RectShape } from "../types";
import { outlinePointsWithBevels } from "../utils/geometry";

type Props = {
  rects: ReadonlyArray<RectShape>;
  active: boolean;
  candidateRectId: string | null;
};

export default function DragOverlayLayer({ rects, active, candidateRectId }: Props) {
  if (!active) return null;
  const candidate = candidateRectId ? rects.find((r) => r.id === candidateRectId) ?? null : null;
  const points = candidate ? outlinePointsWithBevels(candidate) : null;
  return (
    <Layer listening={false} hitGraphEnabled={false}>
      <Rect x={-100000} y={-100000} width={200000} height={200000} fill="#000" opacity={0.35} />
      {rects.map((r) => (
        <Rect key={`hole-${r.id}`} x={r.x} y={r.y} width={r.width} height={r.height} fill="#000" globalCompositeOperation="destination-out" />
      ))}
      {candidate && points && (
        <Line points={points} closed stroke="orange" strokeWidth={3} listening={false} />
      )}
    </Layer>
  );
}


