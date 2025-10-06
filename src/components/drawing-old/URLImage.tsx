import { Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import type { ImageShape, Point, RectShape } from "./types";
import type { Dispatch, SetStateAction } from "react";

type Props = {
  image: ImageShape;
  rects: ReadonlyArray<RectShape>;
  stageScale: number;
  stagePosition: { x: number; y: number };
  setImages: Dispatch<SetStateAction<ImageShape[]>>;
  onSinkDragStart: (id: string) => void;
  onSinkDragMove?: (id: string, x: number, y: number) => void;
  onSinkDragEnd: (id: string, x: number, y: number) => void;
};

export default function URLImage({ image, rects, stageScale, stagePosition, setImages, onSinkDragStart, onSinkDragMove, onSinkDragEnd }: Props) {
  const { id, x, y, width, height, src, parentRectId } = image;
  const [imageEl] = useImage(src);

  return (
    <KonvaImage
      id={id}
      x={x}
      y={y}
      width={width}
      height={height}
      image={imageEl ?? undefined}
      draggable
      onDragStart={(e) => {
        e.cancelBubble = true;
        onSinkDragStart(id);
      }}
      onDragMove={(e) => {
        e.cancelBubble = true;
        if (onSinkDragMove) {
          onSinkDragMove(id, e.target.x(), e.target.y());
        }
      }}
      onDragEnd={(e) => {
        e.cancelBubble = true;
        const newX = e.target.x();
        const newY = e.target.y();
        onSinkDragEnd(id, newX, newY);
      }}
      onMouseDown={(e) => {
        // avoid opening popover while interacting with images
        e.cancelBubble = true;
      }}
      onTouchStart={(e) => {
        e.cancelBubble = true;
      }}
      onContextMenu={(e) => {
        e.evt.preventDefault();
        e.cancelBubble = true;
      }}
    />
  );
}


