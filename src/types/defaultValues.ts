import { EdgeModificationType, EdgeShapePosition } from "@prisma/client";

type EdgeDefaults = {
	depth: number;
	width: number;
	sideAngleLeft: number;
	sideAngleRight: number;
	distance: number;
	fullRadiusDepth: number;
	position: EdgeShapePosition;
};
export const defaultEdgeBumpOutValues = {
	depth: 3,
	width: 30,
	sideAngleLeft: 90,
	sideAngleRight: 90,
	distance: 0,
	fullRadiusDepth: 0,
	position: EdgeShapePosition.Center,
};

export const defaultEdgeBumpInValues = {
	depth: 3,
	width: 30,
	sideAngleLeft: 90,
	sideAngleRight: 90,
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

export const getDefaultValueForEdgeModification = (
	type: EdgeModificationType,
): EdgeDefaults => {
	switch (type) {
		case EdgeModificationType.BumpOut:
			return defaultEdgeBumpOutValues;
		case EdgeModificationType.BumpIn:
			return defaultEdgeBumpInValues;
		case EdgeModificationType.BumpInCurve:
			return defaultEdgeBumpInCurveValues;
		case EdgeModificationType.BumpOutCurve:
			return defaultEdgeBumpOutCurveValues;
		default:
			return defaultEdgeBumpOutValues;
	}
};
