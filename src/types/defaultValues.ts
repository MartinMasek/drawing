import {
	CentrelinesX,
	CentrelinesY,
	CornerType,
	CutoutShape,
	CutoutSinkType,
	EdgeModificationType,
	EdgeShapePosition,
} from "@prisma/client";

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

export const defaultSinkCutoutValues = {
	sinkType: CutoutSinkType.Undermount,
	shape: CutoutShape.Rectangle,
	length: 27.875,
	width: 15.9375,
	holeCount: 3,
	centrelinesX: CentrelinesX.Left,
	centrelinesY: CentrelinesY.Top,
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
		case EdgeModificationType.FullCurve:
			return defaultEdgeFullCurveValues;
		default:
			return defaultEdgeBumpOutValues;
	}
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
