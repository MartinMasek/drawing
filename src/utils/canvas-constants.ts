// Canvas navigation constants
export const ZOOM_STEP = 10; // Increment of zoom
export const CANVAS_MIN_ZOOM = 10; // Minimum zoom level (10%)
export const CANVAS_MAX_ZOOM = 500; // Maximum zoom level (500%)
export const CANVAS_DEFAULT_ZOOM = 100; // Default zoom level (100%)

// Pan/navigation
export const CANVAS_PAN_BUTTON_RIGHT = 2; // Right mouse button
export const CANVAS_PAN_BUTTON_MIDDLE = 1; // Middle mouse button
export const CANVAS_PAN_BUTTON_LEFT = 0; // Left mouse button

// Shape drawing
export const SHAPE_DRAWING_MIN_START_DISTANCE = 30; // Minimum distance before drawing preview appears
export const SHAPE_DRAWING_MIN_DISTANCE = 200; // Minimum distance before we can change direction
export const SHAPE_DRAWING_DEFAULT_HEIGHT = 100; // Default height for the shape

// Edge measurements
export const MEASUREMENT_LINE_STROKE = "#D1D5DB";
export const MEASUREMENT_TEXT_BACKGROUND_COLOR = "#FFFFFF";
export const MEASUREMENT_TEXT_COLOR = "#6B7280";

export const DPI = 4;

// Shape colors
export const SHAPE_SELECTED_STROKE_COLOR = "#2563EB";
export const SHAPE_HOVERED_STROKE_COLOR = "#93C5FD";
export const SHAPE_DEFAULT_STROKE_COLOR = "#9CA3AF";
export const SHAPE_SELECTED_FILL_COLOR = "#EFF6FF";
export const SHAPE_HOVERED_FILL_COLOR = "#FBFCFE";
export const SHAPE_DEFAULT_FILL_COLOR = "#FBFCFE";

export const SHAPE_DRAWING_DRAGGED_EDGE_COLOR = "#F59E0B";
export const SHAPE_DRAWING_OUTLINE_COLOR = "#1D4ED8";
export const SHAPE_DRAWING_FILL_COLOR = "#93C5FD";

// Debounce timing
export const DEBOUNCE_DELAY = 500; // Debounce delay in milliseconds

// Edge stroke widths for interactive elements
export const EDGE_STROKE_WIDTH = 2;
export const EDGE_STROKE_WIDTH_HOVERED = 4;
export const EDGE_STROKE_WIDTH_SELECTED = 6;
export const EDGE_HIT_STROKE_WIDTH = 16;

/**
 * Get stroke color based on shape/edge selection and hover state
 * Priority: selected > hovered > default
 */
export const getStrokeColor = (
	isSelected: boolean,
	isHovered: boolean,
): string => {
	if (isSelected) return SHAPE_SELECTED_STROKE_COLOR;
	if (isHovered) return SHAPE_HOVERED_STROKE_COLOR;
	return SHAPE_DEFAULT_STROKE_COLOR;
};

/**
 * Get fill color based on shape selection and hover state
 * Priority: selected > hovered > default
 */
export const getFillColor = (
	isSelected: boolean,
	isHovered: boolean,
): string => {
	if (isSelected) return SHAPE_SELECTED_FILL_COLOR;
	if (isHovered) return SHAPE_HOVERED_FILL_COLOR;
	return SHAPE_DEFAULT_FILL_COLOR;
};

/**
 * Calculate stroke styling based on edge and modification states
 * Applies edge-level styling if edge is selected/hovered (even if this specific mod isn't)
 */
export const getEdgeStrokeStyle = (
	isEdgeSelected: boolean,
	isEdgeHovered: boolean,
	isModSelected: boolean,
	isModHovered: boolean,
): { strokeColor: string; strokeWidth: number } => {
	const shouldUseEdgeStyle = !isModSelected && (isEdgeSelected || isEdgeHovered);
	
	const strokeColor = shouldUseEdgeStyle 
		? getStrokeColor(isEdgeSelected, isEdgeHovered)
		: getStrokeColor(isModSelected, isModHovered);
	
	const strokeWidth = shouldUseEdgeStyle
		? (isEdgeSelected ? EDGE_STROKE_WIDTH_SELECTED : EDGE_STROKE_WIDTH_HOVERED)
		: (isModSelected
			? EDGE_STROKE_WIDTH_SELECTED
			: isModHovered
				? EDGE_STROKE_WIDTH_HOVERED
				: EDGE_STROKE_WIDTH);
	
	return { strokeColor, strokeWidth };
};
