import { useCallback, useState } from "react";
import type {
	ContextMenuState,
	InteractionMode,
	Point,
	RectShape,
} from "../types";

type Edge = "left" | "right" | "top" | "bottom" | null;
type Corner = "top-left" | "top-right" | "bottom-left" | "bottom-right" | null;

type Deps = {
	mode: InteractionMode;
	rects: ReadonlyArray<RectShape>;
	toScene: (p: Point) => Point;
	findImageAtScenePoint: (point: Point) => { id: string } | null;
	findEdgeAtPointer: (
		point: Point,
	) => { rect: RectShape; edge: Exclude<Edge, null> } | null;
	findCornerAtPointer: (
		point: Point,
	) => { rect: RectShape; corner: Exclude<Corner, null> } | null;
};

export function useContextMenuController({
	mode,
	rects,
	toScene,
	findImageAtScenePoint,
	findEdgeAtPointer,
	findCornerAtPointer,
}: Deps) {
	const [menu, setMenu] = useState<ContextMenuState>({
		isOpen: false,
		clientX: 0,
		clientY: 0,
		rectId: null,
		target: null,
	});

	const closeMenu = useCallback(() => {
		setMenu((m) => ({ ...m, isOpen: false }));
	}, []);

	const openEdge = useCallback(
		(
			rectId: string,
			edge: Exclude<Edge, null>,
			clientX: number,
			clientY: number,
		) => {
			const next = {
				isOpen: true,
				clientX,
				clientY,
				rectId,
				target: { kind: "edge", edge },
			} as const;
			if (menu.isOpen) {
				setMenu((m) => ({ ...m, isOpen: false }));
				setTimeout(() => setMenu(next), 0);
			} else {
				setMenu(next);
			}
		},
		[menu.isOpen],
	);

	const openCorner = useCallback(
		(
			rectId: string,
			corner: Exclude<Corner, null>,
			clientX: number,
			clientY: number,
		) => {
			const next = {
				isOpen: true,
				clientX,
				clientY,
				rectId,
				target: { kind: "corner", corner },
			} as const;
			if (menu.isOpen) {
				setMenu((m) => ({ ...m, isOpen: false }));
				setTimeout(() => setMenu(next), 0);
			} else {
				setMenu(next);
			}
		},
		[menu.isOpen],
	);

	const openRect = useCallback(
		(rectId: string, scenePoint: Point, clientX: number, clientY: number) => {
			const next = {
				isOpen: true,
				clientX,
				clientY,
				rectId,
				target: { kind: "rect", scenePoint },
			} as const;
			if (menu.isOpen) {
				setMenu((m) => ({ ...m, isOpen: false }));
				setTimeout(() => setMenu(next), 0);
			} else {
				setMenu(next);
			}
		},
		[menu.isOpen],
	);

	const openAtContainerPoint = useCallback(
		(containerPoint: Point, clientX: number, clientY: number) => {
			// skip if over image
			const scenePoint = toScene(containerPoint);
			if (findImageAtScenePoint(scenePoint)) return;
			if (mode === "edge" || mode === "edge-new") {
				const found = findEdgeAtPointer(scenePoint);
				if (found) {
					openEdge(found.rect.id, found.edge, clientX, clientY);
				}
				return;
			}
			if (mode === "corner" || mode === "corner-new") {
				const found = findCornerAtPointer(scenePoint);
				if (found) {
					openCorner(found.rect.id, found.corner, clientX, clientY);
				}
				return;
			}
			if (mode === "sink") {
				for (let i = rects.length - 1; i >= 0; i -= 1) {
					const r = rects[i];
					if (!r) continue;
					const inside =
						scenePoint.x >= r.x &&
						scenePoint.x <= r.x + r.width &&
						scenePoint.y >= r.y &&
						scenePoint.y <= r.y + r.height;
					if (inside) {
						openRect(r.id, scenePoint, clientX, clientY);
						return;
					}
				}
			}
		},
		[
			findCornerAtPointer,
			findEdgeAtPointer,
			mode,
			openCorner,
			openEdge,
			openRect,
			rects,
			toScene,
			findImageAtScenePoint,
		],
	);

	return {
		menu,
		setMenu,
		openEdge,
		openCorner,
		openRect,
		closeMenu,
		openAtContainerPoint,
	} as const;
}
