import type Konva from "konva";
import { useCallback, useRef, useState } from "react";
import type { ImageShape, Point, RectShape } from "../../drawing-old/types";

type SinkDragState = {
	active: boolean;
	sinkId: string | null;
	startX: number;
	startY: number;
	startParentRectId: string | null;
	candidateRectId: string | null;
};

export function useSinkDrag(
	rects: ReadonlyArray<RectShape>,
	images: ReadonlyArray<ImageShape>,
	setImages: React.Dispatch<React.SetStateAction<ImageShape[]>>,
	stageRef: React.RefObject<Konva.Stage | null>,
) {
	const [sinkDrag, setSinkDrag] = useState<SinkDragState>({
		active: false,
		sinkId: null,
		startX: 0,
		startY: 0,
		startParentRectId: null,
		candidateRectId: null,
	});
	const startRef = useRef<{
		sinkId: string;
		startX: number;
		startY: number;
		startParentRectId: string | null;
	} | null>(null);

	const forceSetImagePosition = useCallback(
		(imageId: string, x: number, y: number) => {
			const stage = stageRef.current;
			if (!stage) return;
			const node = stage.findOne(`#${imageId}`) as Konva.Image | null;
			if (node) {
				node.position({ x, y });
				node.getLayer()?.batchDraw();
			}
		},
		[stageRef],
	);

	const onSinkDragStart = useCallback(
		(id: string) => {
			const im = images.find((i) => i.id === id);
			if (!im) return;
			startRef.current = {
				sinkId: id,
				startX: im.x,
				startY: im.y,
				startParentRectId: im.parentRectId ?? null,
			};
			setSinkDrag({
				active: true,
				sinkId: id,
				startX: im.x,
				startY: im.y,
				startParentRectId: im.parentRectId ?? null,
				candidateRectId: im.parentRectId ?? null,
			});
		},
		[images],
	);

	const onSinkDragMove = useCallback(
		(id: string, nx: number, ny: number) => {
			const im = images.find((i) => i.id === id);
			if (!im) return;
			const centerX = nx + im.width / 2;
			const centerY = ny + im.height / 2;
			let candidate: string | null = null;
			for (let i = rects.length - 1; i >= 0; i -= 1) {
				const r = rects[i];
				if (!r) continue;
				const inside =
					centerX >= r.x &&
					centerX <= r.x + r.width &&
					centerY >= r.y &&
					centerY <= r.y + r.height;
				if (inside) {
					candidate = r.id;
					break;
				}
			}
			setSinkDrag((s) => ({ ...s, candidateRectId: candidate }));
		},
		[images, rects],
	);

	const onSinkDragEnd = useCallback(
		(id: string, nx: number, ny: number) => {
			const im = images.find((i) => i.id === id);
			const startSnapshot = startRef.current;
			if (!im) {
				setSinkDrag({
					active: false,
					sinkId: null,
					startX: 0,
					startY: 0,
					startParentRectId: null,
					candidateRectId: null,
				});
				startRef.current = null;
				return;
			}
			const centerX = nx + im.width / 2;
			const centerY = ny + im.height / 2;
			let dropRect: string | null = null;
			for (let i = rects.length - 1; i >= 0; i -= 1) {
				const r = rects[i];
				if (!r) continue;
				const inside =
					centerX >= r.x &&
					centerX <= r.x + r.width &&
					centerY >= r.y &&
					centerY <= r.y + r.height;
				if (inside) {
					dropRect = r.id;
					break;
				}
			}
			if (!dropRect) {
				if (startSnapshot && startSnapshot.sinkId === id) {
					setImages((prev) =>
						prev.map((itm) =>
							itm.id === id
								? {
										...itm,
										x: startSnapshot.startX,
										y: startSnapshot.startY,
										parentRectId: startSnapshot.startParentRectId ?? undefined,
									}
								: itm,
						),
					);
					forceSetImagePosition(id, startSnapshot.startX, startSnapshot.startY);
				}
			} else {
				setImages((prev) =>
					prev.map((itm) =>
						itm.id === id
							? { ...itm, x: nx, y: ny, parentRectId: dropRect }
							: itm,
					),
				);
				forceSetImagePosition(id, nx, ny);
			}
			setSinkDrag({
				active: false,
				sinkId: null,
				startX: 0,
				startY: 0,
				startParentRectId: null,
				candidateRectId: null,
			});
			startRef.current = null;
		},
		[images, rects, setImages, forceSetImagePosition],
	);

	return { sinkDrag, onSinkDragStart, onSinkDragMove, onSinkDragEnd } as const;
}
