import {
	CornerType,
	EdgeModificationType,
	EdgeShapePosition,
} from "@prisma/client";
import { calculateAvailablePosition } from "~/components/shape/edge/edgeValidation";

type EdgeDefaults = {
	depth: number;
	width: number;
	sideAngleLeft: number;
	sideAngleRight: number;
	distance: number;
	fullRadiusDepth: number;
	position: EdgeShapePosition;
};

type CornerDefaults = {
	clip: number;
	radius: number;
	modificationLength: number;
	modificationDepth: number;
};

// Minimal edge interface for default value calculation
interface EdgeForDefaults {
	edgeModifications?: Array<{ type: EdgeModificationType; position: EdgeShapePosition }>;
}

export const defaultEdgeBumpOutValues = {
	depth: 3,
	width: 30,
	sideAngleLeft: 0,
	sideAngleRight: 0,
	distance: 0,
	fullRadiusDepth: 0,
	position: EdgeShapePosition.Center,
};

export const defaultEdgeBumpInValues = {
	depth: 3,
	width: 30,
	sideAngleLeft: 0,
	sideAngleRight: 0,
	distance: 0,
	fullRadiusDepth: 0,
	position: EdgeShapePosition.Center,
};

export const defaultEdgeBumpInCurveValues = {
	depth: 3,
	width: 15,
	sideAngleLeft: 0,
	sideAngleRight: 0,
	distance: 0,
	fullRadiusDepth: 0,
	position: EdgeShapePosition.Center,
};

export const defaultEdgeBumpOutCurveValues = {
	depth: 3,
	width: 15,
	sideAngleLeft: 0,
	sideAngleRight: 0,
	distance: 0,
	fullRadiusDepth: 0,
	position: EdgeShapePosition.Center,
	points: [],
};

export const defaultEdgeFullCurveValues = {
	depth: 0,
	width: 0,
	sideAngleLeft: 0,
	sideAngleRight: 0,
	distance: 0,
	fullRadiusDepth: 4,
	position: EdgeShapePosition.Center,
};

export const defaultCornerRadiusValues = {
	clip: 0,
	radius: 4,
	modificationLength: 0,
	modificationDepth: 0,
};

export const defaultCornerClipValues = {
	clip: 4,
	radius: 0,
	modificationLength: 0,
	modificationDepth: 0,
};

export const defaultCornerBumpOutValues = {
	clip: 0,
	radius: 0,
	modificationLength: 4,
	modificationDepth: 2,
};

export const defaultCornerNotchValues = {
	clip: 0,
	radius: 0,
	modificationLength: 4,
	modificationDepth: 4,
};

export const getDefaultValueForEdgeModification = (
	type: EdgeModificationType,
	edge?: EdgeForDefaults,
): EdgeDefaults => {
	let baseDefaults: EdgeDefaults;
	
	switch (type) {
		case EdgeModificationType.BumpOut:
			baseDefaults = defaultEdgeBumpOutValues;
			break;
		case EdgeModificationType.BumpIn:
			baseDefaults = defaultEdgeBumpInValues;
			break;
		case EdgeModificationType.BumpInCurve:
			baseDefaults = defaultEdgeBumpInCurveValues;
			break;
		case EdgeModificationType.BumpOutCurve:
			baseDefaults = defaultEdgeBumpOutCurveValues;
			break;
		case EdgeModificationType.FullCurve:
			baseDefaults = defaultEdgeFullCurveValues;
			break;
		default:
			baseDefaults = defaultEdgeBumpOutValues;
	}

	// If edge is provided, calculate available position based on existing modifications
	// This ensures each new modification gets an unoccupied position
	if (edge) {
		const availablePosition = calculateAvailablePosition(edge, EdgeShapePosition.Center);
		return {
			...baseDefaults,
			position: availablePosition,
		};
	}

	return baseDefaults;
};

export const getDefaultValueForCornerModification = (
	type: CornerType,
): CornerDefaults => {
	switch (type) {
		case CornerType.Radius:
			return defaultCornerRadiusValues;
		case CornerType.Clip:
			return defaultCornerClipValues;
		case CornerType.BumpOut:
			return defaultCornerBumpOutValues;
		case CornerType.Notch:
			return defaultCornerNotchValues;
		default:
			return defaultCornerRadiusValues;
	}
};
