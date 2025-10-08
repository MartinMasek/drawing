import { useCallback, useRef } from "react";
import type { DragDirection, Point, RectDraft } from "../types";

type Deps = {
	tool: string;
	toScene: (p: Point) => Point;
	getContainerPointFromEvent: (evt: MouseEvent) => Point | null;
	getScenePointFromTouchIndex: (evt: TouchEvent, index: number) => Point | null;
	draftForDrag: (
		origin: Point,
		dx: number,
		dy: number,
		dir: DragDirection,
	) => RectDraft;
	setNewRect: (r: RectDraft | null) => void;
	isDrawingRef: React.MutableRefObject<boolean>;
	startPointRef: React.MutableRefObject<Point | null>;
	directionRef: React.MutableRefObject<DragDirection>;
	openAtContainerPoint: (cp: Point, cx: number, cy: number) => void;
};

export function useTouchInteractions({
	tool,
	toScene,
	getContainerPointFromEvent,
	getScenePointFromTouchIndex,
	draftForDrag,
	setNewRect,
	isDrawingRef,
	startPointRef,
	directionRef,
	openAtContainerPoint,
}: Deps) {
	const LONG_PRESS_MS = 450;
	const TAP_MOVE_TOLERANCE = 8;

	const touchLongPressTimer = useRef<number | null>(null);
	const touchStartContainerPoint = useRef<Point | null>(null);
	const touchHasLongPressed = useRef<boolean>(false);
	const touchMovedBeyondTolerance = useRef<boolean>(false);

	const clearTouchTimers = useCallback(() => {
		if (touchLongPressTimer.current != null) {
			window.clearTimeout(touchLongPressTimer.current);
			touchLongPressTimer.current = null;
		}
	}, []);

	const onTouchStart = useCallback(
		(e: { evt: TouchEvent; target?: unknown }) => {
			if (e.evt.touches.length === 1) {
				e.evt.preventDefault();
				const t = e.evt.touches.item(0);
				if (!t) return;
				const containerPoint = getContainerPointFromEvent({
					clientX: t.clientX,
					clientY: t.clientY,
				} as unknown as MouseEvent);
				if (!containerPoint) return;
				touchStartContainerPoint.current = containerPoint;
				touchHasLongPressed.current = false;
				touchMovedBeyondTolerance.current = false;
				clearTouchTimers();
				if (tool === "rect") {
					touchLongPressTimer.current = window.setTimeout(() => {
						const start =
							getScenePointFromTouchIndex(e.evt, 0) ?? toScene(containerPoint);
						touchHasLongPressed.current = true;
						isDrawingRef.current = true;
						startPointRef.current = start;
						directionRef.current = null;
						setNewRect({
							x: start.x,
							y: start.y - 100 / 2,
							width: 100,
							height: 100,
						});
					}, LONG_PRESS_MS);
				}
				return;
			}
			clearTouchTimers();
		},
		[
			clearTouchTimers,
			directionRef,
			getContainerPointFromEvent,
			getScenePointFromTouchIndex,
			isDrawingRef,
			setNewRect,
			startPointRef,
			toScene,
			tool,
		],
	);

	const onTouchMove = useCallback(
		(e: { evt: TouchEvent }) => {
			if (e.evt.touches.length === 1) {
				const t = e.evt.touches.item(0);
				if (!t) return;
				const containerPoint = getContainerPointFromEvent({
					clientX: t.clientX,
					clientY: t.clientY,
				} as unknown as MouseEvent);
				if (!containerPoint) return;
				if (!touchHasLongPressed.current) {
					if (touchStartContainerPoint.current) {
						const dx = containerPoint.x - touchStartContainerPoint.current.x;
						const dy = containerPoint.y - touchStartContainerPoint.current.y;
						const moved = Math.hypot(dx, dy) > TAP_MOVE_TOLERANCE;
						if (moved && !touchMovedBeyondTolerance.current) {
							touchMovedBeyondTolerance.current = true;
							clearTouchTimers();
						}
					}
					return;
				}
				if (tool === "rect") {
					if (!isDrawingRef.current || !startPointRef.current) return;
					e.evt.preventDefault();
					const pos = getScenePointFromTouchIndex(e.evt, 0);
					if (!pos) return;
					const dx = pos.x - startPointRef.current.x;
					const dy = pos.y - startPointRef.current.y;
					const draft = draftForDrag(
						startPointRef.current,
						dx,
						dy,
						directionRef.current,
					);
					setNewRect(draft);
					return;
				}
				return;
			}
		},
		[
			clearTouchTimers,
			directionRef,
			draftForDrag,
			getContainerPointFromEvent,
			getScenePointFromTouchIndex,
			isDrawingRef,
			setNewRect,
			startPointRef,
			tool,
		],
	);

	const onTouchEnd = useCallback(
		(e: {
			evt: TouchEvent;
			target?: {
				getStage?: () => {
					container: () => { getBoundingClientRect: () => DOMRect };
				};
			};
		}) => {
			if (e.evt.touches.length === 0) {
				clearTouchTimers();
				if (tool !== "rect") {
					if (
						!touchMovedBeyondTolerance.current &&
						touchStartContainerPoint.current
					) {
						const stage = e.target?.getStage ? e.target.getStage() : null;
						if (stage) {
							const rect = stage.container().getBoundingClientRect();
							const cp = touchStartContainerPoint.current;
							openAtContainerPoint(cp, rect.left + cp.x, rect.top + cp.y);
						}
					}
				}
				touchHasLongPressed.current = false;
				touchMovedBeyondTolerance.current = false;
				touchStartContainerPoint.current = null;
			}
		},
		[clearTouchTimers, openAtContainerPoint, tool],
	);

	return { onTouchStart, onTouchMove, onTouchEnd } as const;
}
