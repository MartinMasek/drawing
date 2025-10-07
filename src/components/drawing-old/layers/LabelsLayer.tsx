import { Layer, Line, Rect, Text } from "react-konva";
import type { RectShape, LineShape, Point, RectDraft } from "../types";
import type { ReactNode } from "react";
import { Fragment } from "react";

type Props = {
  rects: ReadonlyArray<RectShape>;
  lines: ReadonlyArray<LineShape>;
  newRect: RectDraft | null;
  draftSegments?: ReadonlyArray<RectDraft>;
  stageScale: number;
  renderLabels: (r: RectDraft) => ReactNode;
  distanceClick: (rectId: string, sinkId: string, value: number) => void;
  images: ReadonlyArray<{ id: string; x: number; y: number; width: number; height: number; parentRectId?: string }>; 
};

export default function LabelsLayer({ rects, lines, newRect, draftSegments, stageScale, renderLabels, distanceClick, images }: Props) {
  return (
    <>
      <Layer listening={false} hitGraphEnabled={false}>
        {lines.map((ln) => (
          <Line
            key={ln.id}
            points={ln.kind === "v" ? [ln.at, -100000, ln.at, 100000] : [-100000, ln.at, 100000, ln.at]}
            stroke="#94a3b8"
            dash={[6, 4]}
            strokeWidth={1}
            listening={false}
          />
        ))}
        {draftSegments?.map((seg) => (
          <Rect
            key={`${seg.x}-${seg.y}-${seg.width}-${seg.height}`}
            x={seg.x}
            y={seg.y}
            width={seg.width}
            height={seg.height}
            stroke="red"
            dash={[4, 4]}
            strokeWidth={2}
            perfectDrawEnabled={false}
            shadowForStrokeEnabled={false}
            listening={false}
          />
        ))}
        {newRect && (
          <Rect
            x={newRect.x}
            y={newRect.y}
            width={newRect.width}
            height={newRect.height}
            stroke="red"
            dash={[4, 4]}
            strokeWidth={2}
            perfectDrawEnabled={false}
            shadowForStrokeEnabled={false}
            listening={false}
          />
        )}
        {(rects.length <= 300 || stageScale > 1.5) && (
          <>
            {rects.map((r) => (
              <Fragment key={`label-${r.id}`}>{renderLabels(r)}</Fragment>
            ))}
            {newRect && renderLabels(newRect)}
            {draftSegments?.map((seg) => (
              <Fragment key={`label-draft-${seg.x}-${seg.y}-${seg.width}-${seg.height}`}>{renderLabels(seg)}</Fragment>
            ))}
          </>
        )}
      </Layer>
      {(rects.length <= 300 || stageScale > 1.5) && (
        <Layer>
          {rects.map((r) => {
            const sinks = images.filter((img) => img.parentRectId === r.id);
            return sinks.map((img, idx) => {
              const centerX = img.x + img.width / 2;
              const distancePx = Math.round(centerX - r.x);
              return (
                <Text
                  key={`sinkdist-${r.id}-${img.id}`}
                  x={r.x + 4}
                  y={r.y + r.height + 4 + idx * 14}
                  text={`${distancePx} px`}
                  fontSize={12}
                  fill="purple"
                  scaleX={1 / stageScale}
                  scaleY={1 / stageScale}
                  listening
                  onClick={() => distanceClick(r.id, img.id, Math.max(0, centerX - r.x))}
                />
              );
            });
          })}
        </Layer>
      )}
    </>
  );
}


