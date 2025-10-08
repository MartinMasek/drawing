import type {
	ContextMenuState,
	Corner,
	Edge,
	Point,
	RectShape,
} from "../types";

export function isOnEdge(
	r: RectShape,
	pointer: Point,
	tolerance: number,
): Edge {
	const localX = pointer.x - r.x;
	const localY = pointer.y - r.y;
	const nearLeft =
		localX >= -tolerance &&
		localX <= tolerance &&
		localY >= -tolerance &&
		localY <= r.height + tolerance;
	const nearRight =
		localX >= r.width - tolerance &&
		localX <= r.width + tolerance &&
		localY >= -tolerance &&
		localY <= r.height + tolerance;
	const nearTop =
		localY >= -tolerance &&
		localY <= tolerance &&
		localX >= -tolerance &&
		localX <= r.width + tolerance;
	const nearBottom =
		localY >= r.height - tolerance &&
		localY <= r.height + tolerance &&
		localX >= -tolerance &&
		localX <= r.width + tolerance;
	if (nearLeft) return "left";
	if (nearRight) return "right";
	if (nearTop) return "top";
	if (nearBottom) return "bottom";
	return null;
}

export function isOnCorner(
	r: RectShape,
	pointer: Point,
	tolerance: number,
): Corner {
	const localX = pointer.x - r.x;
	const localY = pointer.y - r.y;
	const near = (x: number, y: number) =>
		Math.abs(localX - x) <= tolerance && Math.abs(localY - y) <= tolerance;
	if (near(0, 0)) return "top-left";
	if (near(r.width, 0)) return "top-right";
	if (near(0, r.height)) return "bottom-left";
	if (near(r.width, r.height)) return "bottom-right";
	return null;
}

export function findEdgeAtPointer(
	rects: ReadonlyArray<RectShape>,
	point: Point,
	tolerance: number,
): { rect: RectShape; edge: Exclude<Edge, null> } | null {
	for (let i = rects.length - 1; i >= 0; i -= 1) {
		const candidate = rects[i];
		if (!candidate) continue;
		const edge = isOnEdge(candidate, point, tolerance);
		if (edge) return { rect: candidate, edge };
	}
	return null;
}

export function findCornerAtPointer(
	rects: ReadonlyArray<RectShape>,
	point: Point,
	tolerance: number,
): { rect: RectShape; corner: Exclude<Corner, null> } | null {
	for (let i = rects.length - 1; i >= 0; i -= 1) {
		const candidate = rects[i];
		if (!candidate) continue;
		const corner = isOnCorner(candidate, point, tolerance);
		if (corner) return { rect: candidate, corner };
	}
	return null;
}

export function findRectAtPoint(
	rects: ReadonlyArray<RectShape>,
	point: Point,
): RectShape | null {
	for (let i = rects.length - 1; i >= 0; i -= 1) {
		const r = rects[i];
		if (!r) continue;
		const inside =
			point.x >= r.x &&
			point.x <= r.x + r.width &&
			point.y >= r.y &&
			point.y <= r.y + r.height;
		if (inside) return r;
	}
	return null;
}
