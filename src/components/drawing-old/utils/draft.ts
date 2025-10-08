import type { Point, RectDraft } from "../types";

export type DragDirection = "right" | "left" | "up" | "down" | null;

export function chooseDirection(
	dx: number,
	dy: number,
): Exclude<DragDirection, null> {
	if (Math.abs(dx) > Math.abs(dy)) {
		return dx >= 0 ? "right" : "left";
	}
	return dy >= 0 ? "down" : "up";
}

export function draftForDrag(
	origin: Point,
	dx: number,
	dy: number,
	currentDirection: DragDirection,
	defaults: {
		SNAP_TO_ORIGIN: number;
		DEFAULT_SIZE: number;
		MIN_SIZE: number;
		SNAP_SIZE: number;
	},
): RectDraft {
	let nextDirection = currentDirection;

	if (
		Math.abs(dx) < defaults.SNAP_TO_ORIGIN &&
		Math.abs(dy) < defaults.SNAP_TO_ORIGIN
	) {
		nextDirection = null;
		return {
			x: origin.x,
			y: origin.y - defaults.DEFAULT_SIZE / 2,
			width: defaults.DEFAULT_SIZE,
			height: defaults.DEFAULT_SIZE,
		};
	}
	if (!nextDirection) nextDirection = chooseDirection(dx, dy);

	const absDx = Math.abs(dx);
	const absDy = Math.abs(dy);
	let draft: RectDraft;
	switch (nextDirection) {
		case "right":
			draft = {
				x: origin.x,
				y: origin.y - defaults.DEFAULT_SIZE / 2,
				width: defaults.MIN_SIZE + absDx,
				height: defaults.DEFAULT_SIZE,
			};
			break;
		case "left":
			draft = {
				x: origin.x - (defaults.MIN_SIZE + absDx),
				y: origin.y - defaults.DEFAULT_SIZE / 2,
				width: defaults.MIN_SIZE + absDx,
				height: defaults.DEFAULT_SIZE,
			};
			break;
		case "down":
			draft = {
				x: origin.x,
				y: origin.y - (defaults.MIN_SIZE + absDy) / 2,
				width: defaults.DEFAULT_SIZE,
				height: defaults.MIN_SIZE + absDy,
			};
			break;
		case "up":
			draft = {
				x: origin.x,
				y: origin.y - (defaults.MIN_SIZE + absDy) / 2,
				width: defaults.DEFAULT_SIZE,
				height: defaults.MIN_SIZE + absDy,
			};
			break;
		default:
			draft = {
				x: origin.x,
				y: origin.y - defaults.DEFAULT_SIZE / 2,
				width: defaults.DEFAULT_SIZE,
				height: defaults.DEFAULT_SIZE,
			};
	}
	if (
		Math.abs(draft.width - defaults.DEFAULT_SIZE) < defaults.SNAP_SIZE &&
		Math.abs(draft.height - defaults.DEFAULT_SIZE) < defaults.SNAP_SIZE
	) {
		return {
			x: origin.x,
			y: origin.y - defaults.DEFAULT_SIZE / 2,
			width: defaults.DEFAULT_SIZE,
			height: defaults.DEFAULT_SIZE,
		};
	}
	return draft;
}
