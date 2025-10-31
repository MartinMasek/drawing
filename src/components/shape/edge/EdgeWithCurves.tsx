import { memo } from "react";
import { Shape, Line, Group } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import type { EdgeModification, Point } from "~/types/drawing";
import { EdgeModificationType, EdgeShapePosition } from "@prisma/client";
import { getStrokeColor } from "~/utils/canvas-constants";
import { drawEdgeWithModifications } from "~/components/shape/edgeUtils";

// Constants for interactive elements
const EDGE_STROKE_WIDTH = 2;
const EDGE_STROKE_WIDTH_HOVERED = 4;
const EDGE_STROKE_WIDTH_SELECTED = 6;
const EDGE_HIT_STROKE_WIDTH = 16;

interface EdgeWithCurvesProps {
	edgeIndex: number;
	point: Point;
	nextPoint: Point;
	edgeModifications: EdgeModification[];
	isEdgeHovered: boolean;
	isEdgeSelected: boolean;
	hoveredModificationId: string | null;
	selectedModificationId: string | null;
	handleModificationClick: (
		edgeIndex: number,
		modificationId: string,
		e: KonvaEventObject<MouseEvent>,
	) => void;
	handleEmptyEdgeClick: (
		edgeIndex: number,
		point1Id: string,
		point2Id: string,
		clickPosition: EdgeShapePosition,
		e: KonvaEventObject<MouseEvent>,
	) => void;
	handleEdgeMouseEnter: (index: number) => void;
	handleEdgeMouseLeave: () => void;
	handleModificationMouseEnter: (modificationId: string) => void;
	handleModificationMouseLeave: () => void;
}

/**
 * Calculate which position an empty segment represents
 */
function getEmptySegmentPosition(
	modifications: EdgeModification[],
): EdgeShapePosition {
	const occupiedPositions = modifications.map((m) => m.position);

	if (modifications.length === 0) {
		return EdgeShapePosition.Center;
	}

	if (modifications.length === 1) {
		const occupiedPosition = modifications[0]?.position;
		if (occupiedPosition === EdgeShapePosition.Center) {
			return EdgeShapePosition.Left;
		}
		return EdgeShapePosition.Center;
	}

	const allPositions = [EdgeShapePosition.Left, EdgeShapePosition.Center, EdgeShapePosition.Right];
	return allPositions.find((p) => !occupiedPositions.includes(p)) ?? EdgeShapePosition.Center;
}

/**
 * Curved edge renderer with segmented rendering
 * Each curve modification is separately clickable
 * FullCurve occupies the entire edge
 */
const EdgeWithCurves = ({
	edgeIndex,
	point,
	nextPoint,
	edgeModifications,
	isEdgeHovered,
	isEdgeSelected,
	hoveredModificationId,
	selectedModificationId,
	handleModificationClick,
	handleEmptyEdgeClick,
	handleEdgeMouseEnter,
	handleEdgeMouseLeave,
	handleModificationMouseEnter,
	handleModificationMouseLeave,
}: EdgeWithCurvesProps) => {
	// Check if we have a FullCurve (it occupies the entire edge)
	const fullCurveMod = edgeModifications.find(
		(mod) => mod.type === EdgeModificationType.FullCurve,
	);

	if (fullCurveMod?.id) {
		const modId = fullCurveMod.id;
		const isModHovered = hoveredModificationId === modId;
		const isModSelected = selectedModificationId === modId;

		// FullCurve - single Shape for entire edge
		return (
			<Shape
				sceneFunc={(ctx, shape) => {
					ctx.beginPath();
					drawEdgeWithModifications(ctx, point, nextPoint, [fullCurveMod], false);
					ctx.fillStrokeShape(shape);
				}}
				stroke={getStrokeColor(isModSelected, isModHovered)}
				strokeWidth={
					isModSelected
						? EDGE_STROKE_WIDTH_SELECTED
						: isModHovered
							? EDGE_STROKE_WIDTH_HOVERED
							: EDGE_STROKE_WIDTH
				}
				hitStrokeWidth={EDGE_HIT_STROKE_WIDTH}
				listening
				onClick={(e) =>
					handleModificationClick(edgeIndex, modId, e)
				}
				onMouseEnter={() => handleModificationMouseEnter(modId)}
				onMouseLeave={handleModificationMouseLeave}
			/>
		);
	}

	// Multiple curve modifications or mix of curves and straight segments
	// Sort by position
	const sortedMods = [...edgeModifications].sort((a, b) => {
		const posOrder = { Left: 0, Center: 1, Right: 2 };
		return posOrder[a.position] - posOrder[b.position];
	});

	const segments: Array<{
		type: "modification" | "empty";
		modification?: EdgeModification;
		startPoint: Point;
		endPoint: Point;
		position?: EdgeShapePosition;
	}> = [];

	let currentPoint: Point = point;

	for (const mod of sortedMods) {
		if (mod.points && mod.points.length >= 2) {
			const modStart = mod.points[0];
			const modEnd = mod.points[mod.points.length - 1];

			if (!modStart || !modEnd) continue;

			// Empty segment before modification
			const dx = modStart.xPos - currentPoint.xPos;
			const dy = modStart.yPos - currentPoint.yPos;
			const distance = Math.sqrt(dx * dx + dy * dy);

			if (distance > 0.1) {
				segments.push({
					type: "empty",
					startPoint: currentPoint,
					endPoint: modStart,
					position: getEmptySegmentPosition(sortedMods),
				});
			}

			// Modification segment
			segments.push({
				type: "modification",
				modification: mod,
				startPoint: modStart,
				endPoint: modEnd,
			});

			currentPoint = modEnd;
		}
	}

	// Empty segment after last modification
	const dx = nextPoint.xPos - currentPoint.xPos;
	const dy = nextPoint.yPos - currentPoint.yPos;
	const distance = Math.sqrt(dx * dx + dy * dy);

	if (distance > 0.1) {
		segments.push({
			type: "empty",
			startPoint: currentPoint,
			endPoint: nextPoint,
			position: getEmptySegmentPosition(sortedMods),
		});
	}

	return (
		<Group>
			{segments.map((segment) => {
				if (segment.type === "modification" && segment.modification?.id) {
					const mod = segment.modification;
					const modId = mod.id;
					const isModHovered = hoveredModificationId === modId;
					const isModSelected = selectedModificationId === modId;

					return (
						<Shape
							key={`mod-${modId}`}
							sceneFunc={(ctx, shape) => {
								ctx.beginPath();
								drawEdgeWithModifications(
									ctx,
									segment.startPoint,
									segment.endPoint,
									[mod],
									false,
								);
								ctx.fillStrokeShape(shape);
							}}
							stroke={getStrokeColor(isModSelected, isModHovered)}
							strokeWidth={
								isModSelected
									? EDGE_STROKE_WIDTH_SELECTED
									: isModHovered
										? EDGE_STROKE_WIDTH_HOVERED
										: EDGE_STROKE_WIDTH
							}
							hitStrokeWidth={EDGE_HIT_STROKE_WIDTH}
							listening
							onClick={(e) => {
								if (modId) {
									handleModificationClick(edgeIndex, modId, e);
								}
							}}
							onMouseEnter={() => {
								if (modId) {
									handleModificationMouseEnter(modId);
								}
							}}
							onMouseLeave={handleModificationMouseLeave}
						/>
					);
				}
				
				// Empty segment - straight line
				const segmentKey = `empty-${edgeIndex}-${segment.startPoint.xPos}-${segment.startPoint.yPos}`;
				return (
					<Line
						key={segmentKey}
						points={[
							segment.startPoint.xPos,
							segment.startPoint.yPos,
							segment.endPoint.xPos,
							segment.endPoint.yPos,
						]}
						stroke={getStrokeColor(isEdgeSelected, isEdgeHovered)}
						strokeWidth={
							isEdgeSelected
								? EDGE_STROKE_WIDTH_SELECTED
								: isEdgeHovered
									? EDGE_STROKE_WIDTH_HOVERED
									: EDGE_STROKE_WIDTH
						}
						hitStrokeWidth={EDGE_HIT_STROKE_WIDTH}
						listening
						onClick={(e) =>
							handleEmptyEdgeClick(
								edgeIndex,
								point.id,
								nextPoint.id,
								segment.position ?? EdgeShapePosition.Center,
								e,
							)
						}
						onMouseEnter={() => handleEdgeMouseEnter(edgeIndex)}
						onMouseLeave={handleEdgeMouseLeave}
					/>
				);
			})}
		</Group>
	);
};

export default memo(EdgeWithCurves);
