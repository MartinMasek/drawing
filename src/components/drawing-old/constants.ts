export const MIN_SIZE = 10;
export const DEFAULT_SIZE = 100;

export const SNAP_TO_ORIGIN = 10; // px — considered "at origin"
export const SNAP_SIZE = 15; // px — snap back to default size
export const EDGE_TOLERANCE = 10; // px — sensitivity for edge detection

// L-shape drawing thresholds
export const L_TURN_MIN_PX = 300; // require at least this segment length before allowing a turn
export const L_TURN_DEADBAND_PX = 8; // ignore tiny vertical wiggles before committing to the vertical leg

export const ZOOM_MIN = 0.05; // minimum scale (max zoom-out)
export const ZOOM_MAX = 10; // maximum scale (max zoom-in)

export const LONG_PRESS_MS = 450;
export const TAP_MOVE_TOLERANCE = 8; // px in container space

export const EDGE_COLOR_OPTIONS = [
	"#ef4444",
	"#22c55e",
	"#3b82f6",
	"#f59e0b",
	"#000000",
	"#9ca3af",
] as const;

export const IMAGE_OPTIONS = [
	{ label: "Favicon", src: "https://konvajs.org/assets/yoda.jpg" },
	{ label: "Avatar", src: "https://i.pravatar.cc/150?img=5" },
	{ label: "Landscape", src: "https://picsum.photos/seed/land/320/180" },
	{ label: "Pattern", src: "https://picsum.photos/seed/pat/200/200" },
] as const;

export const STAGE_WIDTH = 800;
export const STAGE_HEIGHT = 600;
