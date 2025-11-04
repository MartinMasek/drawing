import { memo } from "react";
import { Line, Group } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import type { EdgeModification, Point } from "~/types/drawing";
import { EdgeShapePosition } from "@prisma/client";
import {
	getStrokeColor,
	getEdgeStrokeStyle,
	EDGE_STROKE_WIDTH,
	EDGE_STROKE_WIDTH_HOVERED,
	EDGE_STROKE_WIDTH_SELECTED,
	EDGE_HIT_STROKE_WIDTH,
} from "~/utils/canvas-constants";

interface EdgeStraightProps {
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
 * Calculate which position an empty segment represents based on existing modifications
 */
function getEmptySegmentPosition(
	modifications: EdgeModification[],
	segmentIndex: number,
): EdgeShapePosition {
	const occupiedPositions = modifications.map((m) => m.position);

	// No modifications - all positions available, default to Center
	if (modifications.length === 0) {
		return EdgeShapePosition.Center;
	}

	// One modification - available positions are the unoccupied ones
	if (modifications.length === 1) {
		const occupiedPosition = modifications[0]?.position;
		
		// If center is occupied, prefer left
		if (occupiedPosition === EdgeShapePosition.Center) {
			return EdgeShapePosition.Left;
		}
		
		// Otherwise use center
		return EdgeShapePosition.Center;
	}

	// Two modifications - use the remaining position
	const allPositions = [EdgeShapePosition.Left, EdgeShapePosition.Center, EdgeShapePosition.Right];
	return allPositions.find((p) => !occupiedPositions.includes(p)) ?? EdgeShapePosition.Center;
}

/**
 * Straight edge renderer with segmented rendering
 * Each modification and empty edge segment is separately clickable
 */
const EdgeStraight = ({
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
}: EdgeStraightProps) => {
	// If no modifications, render as single clickable line
	if (edgeModifications.length === 0) {
		return (
			<Line
				points={[point.xPos, point.yPos, nextPoint.xPos, nextPoint.yPos]}
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
					handleEmptyEdgeClick(edgeIndex, point.id, nextPoint.id, EdgeShapePosition.Center, e)
				}
				onMouseEnter={() => handleEdgeMouseEnter(edgeIndex)}
				onMouseLeave={handleEdgeMouseLeave}
			/>
		);
	}

	// Build segments: each modification is a segment, spaces between are empty segments
	// Sort modifications by position (Left < Center < Right)
	const sortedMods = [...edgeModifications].sort((a, b) => {
		const posOrder = { Left: 0, Center: 1, Right: 2 };
		return posOrder[a.position] - posOrder[b.position];
	});

	const segments: Array<{
		points: number[];
		type: "modification" | "empty";
		modificationId?: string;
		position?: EdgeShapePosition;
	}> = [];

	// Start point
	let currentPoint = [point.xPos, point.yPos];

	for (const mod of sortedMods) {
		// If modification has points, it defines the segment
		if (mod.points && mod.points.length >= 2) {
			const modPoints = mod.points;
			const modStart = [modPoints[0]?.xPos ?? 0, modPoints[0]?.yPos ?? 0];
			const modEnd = [modPoints[modPoints.length - 1]?.xPos ?? 0, modPoints[modPoints.length - 1]?.yPos ?? 0];

			// Empty segment before modification (if needed)
			if (currentPoint[0] !== modStart[0] || currentPoint[1] !== modStart[1]) {
				segments.push({
					points: [...currentPoint, ...modStart],
					type: "empty",
					position: getEmptySegmentPosition(sortedMods, segments.length),
				});
			}

			// Modification segment
			const modAllPoints: number[] = [];
			for (const p of modPoints) {
				modAllPoints.push(p.xPos, p.yPos);
			}
			segments.push({
				points: modAllPoints,
				type: "modification",
				modificationId: mod.id ?? undefined,
			});

			currentPoint = modEnd;
		}
	}

	// Empty segment after last modification (if needed)
	if (currentPoint[0] !== nextPoint.xPos || currentPoint[1] !== nextPoint.yPos) {
		segments.push({
			points: [...currentPoint, nextPoint.xPos, nextPoint.yPos],
			type: "empty",
			position: getEmptySegmentPosition(sortedMods, segments.length),
		});
	}

	// Render each segment
	return (
		<Group>
			{segments.map((segment, idx) => {
				if (segment.type === "modification" && segment.modificationId) {
					const modId = segment.modificationId;
					const isModHovered = hoveredModificationId === modId;
					const isModSelected = selectedModificationId === modId;

					const { strokeColor, strokeWidth } = getEdgeStrokeStyle(
						isEdgeSelected,
						isEdgeHovered,
						isModSelected,
						isModHovered,
					);

					return (
						<Line
							key={`mod-${modId}`}
							points={segment.points}
							stroke={strokeColor}
							strokeWidth={strokeWidth}
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
				
				// Empty segment
				const segmentKey = `empty-${edgeIndex}-${segment.points[0]}-${segment.points[1]}`;
				return (
					<Line
						key={segmentKey}
						points={segment.points}
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

export default memo(EdgeStraight);

