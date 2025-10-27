// #########################################################
// IMPORTANT: Drawing types are for now just prepared for demo version. It will be changed to match correct data model.
// #########################################################

import { EdgeModificationType, type EdgeShapePosition } from "@prisma/client";
import { DrawingTab } from "~/components/header/header/drawing-types";

export interface Design {
	id: string;
	name: string;
	shapes: Shape[];
}

export interface Shape {
	id: string;
	xPos: number;
	yPos: number;
	points: Point[];
	rotation: number;
	startEdge: Edge;
	endEdge: Edge;
	edges: Edge[];
	corners: Corner[];
	cutouts: Cutout[];
}

// Lightweight coordinate type without ID (for calculations and intermediate data)
export type Coordinate = {
	xPos: number;
	yPos: number;
};

// Point with ID (for rendering and final data structures)
export interface Point {
	id: string;
	xPos: number;
	yPos: number;
}

// Drawing direction enums
export enum DrawingAxis {
	Horizontal = "horizontal",
	Vertical = "vertical",
}

export enum CardinalDirection {
	Up = "up",
	Down = "down",
	Left = "left",
	Right = "right",
}

export interface Edge {
	id: string;
	point1: Point;
	point2: Point;
	shape: EdgeShape[];
	linkedService: string; // TODO: Define Service type
	backsplashConfig?: BacksplashConfig;
	waterfallConfig?: WaterfallConfig;
}

export type EdgeType = "Right" | "Center" | "Left";
export type EdgeBump = "BumpIn" | "BumpOut";

export interface EdgeShape {
	id: string;
	depth: number;
	width: number;
	type: EdgeType;
	edges: EdgeBump[];
	distance: number;
	sideAngleLeft: number;
	sideAngleRight: number;
}

export type CornerType = "Clip" | "BumpOut" | "None";
export type CornerModRotation = string; // TODO: Define specific rotation type

export interface Corner {
	id: string;
	point: Point;
	cornerModification: CornerModRotation;
	type: CornerType;
	clip?: number;
	radius: number;
	bumpInLength?: number;
	bumpOutLength?: number;
	bumpOutDepth?: number;
	linkedService: string; // TODO: Define Service type
}

export interface Cutout {
	id: string;
	posX: number;
	posY: number;
	config: CutoutConfig;
	template?: CutoutTemplate;
}

export interface CutoutTemplate {
	id: string;
	name: string;
	config: CutoutConfig;
}

export type SinkType = "Undermount" | "Drop-in" | "Oval" | "Double";
export type CutoutShape = "Rectangle" | "Oval" | "Double";

export interface CutoutConfig {
	id: string;
	sinkType: SinkType;
	shape: CutoutShape;
	length: number;
	width: number;
	holeCount: number;
	centerRules: string; // TODO: Define CenterRules type
	faucetRules: string; // TODO: Define FaucetRules type
	product: Product;
	linkedService: Service;
}

export interface BacksplashConfig {
	id: string;
	service: Service;
	material: Material;
	height: number;
}

export interface WaterfallConfig {
	id: string;
	service: Service;
	material: Material;
	height: number;
}

// Placeholder types to be defined
export interface Service {
	id: string;
	name: string;
}

export interface Material {
	id: string;
	name: string;
}

export interface Product {
	id: string;
	name: string;
}

// Lightweight types for rendering on the canvas
// Only fields required by the Konva layer are included
// This will probably be removed when we need every field for the canvas at some point
export type CanvasShape = {
	id: string;
	/**
	 * Stable client-side ID used as React component key.
	 *
	 * Why we need this:
	 * When a shape is created, it gets a temporary ID (temp-xxx) for optimistic updates.
	 * Once the server responds, we replace the temp ID with the real database ID.
	 *
	 * Problem: Changing the ID mid-drag causes React to unmount/remount the component
	 * (because the key changes), which breaks Konva's internal drag state.
	 *
	 * Solution: clientId stays constant throughout the shape's lifetime, preventing
	 * component remounting during temp->real ID transitions, thus preserving drag state.
	 */
	clientId?: string;
	xPos: number;
	yPos: number;
	rotation: number;
	points: ReadonlyArray<Point>;
	material?: MaterialExtended;
	/**
	 * Pre-calculated edge point indices for start and end edges.
	 * These are calculated on the backend for efficient frontend visualization.
	 */
	edgeIndices?: {
		startPoint1: number;
		startPoint2: number;
		endPoint1: number;
		endPoint2: number;
	} | null;
	edges: {
		id: string;
		point1Id: string;
		point2Id: string;
		edgeModifications: EdgeModification[];
	}[];
};

export type CanvasText = {
	id: string;
	xPos: number;
	yPos: number;
	text: string;
	fontSize: number;
	isBold: boolean;
	isItalic: boolean;
	textColor: string;
	backgroundColor: string;
};

export type CanvasTextData = {
	text: string;
	fontSize: number;
	isBold: boolean;
	isItalic: boolean;
	textColor: string;
	backgroundColor: string;
	xPos: number;
	yPos: number;
};

export type MaterialExtended = {
	id: string;
	name: string;
	img: string | null;
	SKU: string;
	category: string;
	subcategory: string;
};

export type SelectedPoint = {
	shapeId: string;
	pointIndex: number;
};

export type SelectedEdge = {
	shapeId: string;
	edgeIndex: number;
	edgeId: string | null;
	edgePoint1Id: string;
	edgePoint2Id: string;
	edgeModification: EdgeModification | undefined;
};

export type EdgeModification = {
	id: string | null;
	type: EdgeModificationType;
	position: EdgeShapePosition;
	distance: number;
	depth: number;
	width: number;
	sideAngleLeft: number;
	sideAngleRight: number;
	fullRadiusDepth: number;
	points: Point[];
};

export const EdgeModificationList: {
	id: EdgeModificationType;
	label: string;
}[] = [
	{ id: EdgeModificationType.BumpIn, label: "Bump-In" },
	{ id: EdgeModificationType.BumpOut, label: "Bump-Out" },
	{ id: EdgeModificationType.BumpInCurve, label: "Bump-In Curve" },
	{ id: EdgeModificationType.BumpOutCurve, label: "Bump-Out Curve" },
	{ id: EdgeModificationType.FullCurve, label: "Full Curve" },
	{ id: EdgeModificationType.None, label: "None" },
];
