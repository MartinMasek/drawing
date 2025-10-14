// #########################################################
// IMPORTANT: Drawing types are for now just prepared for demo version. It will be changed to match correct data model.
// #########################################################

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
	xPos: number;
	yPos: number;
	rotation: number;
	points: ReadonlyArray<Coordinate>;
	materialId?: string;
};
