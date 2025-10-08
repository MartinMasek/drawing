export enum DrawingTab {
	Dimensions = 1,
	Shape = 2,
	Edges = 3,
	Cutouts = 4,
	Layout = 5,
	Quote = 6,
}
export const DrawingTabList: { id: DrawingTab; label: string }[] = [
	{ id: DrawingTab.Dimensions, label: "Dimensions" },
	{ id: DrawingTab.Shape, label: "Shape" },
	{ id: DrawingTab.Edges, label: "Edges" },
	{ id: DrawingTab.Cutouts, label: "Cutouts" },
	{ id: DrawingTab.Layout, label: "Layout" },
	{ id: DrawingTab.Quote, label: "Quote" },
];

export enum CursorTypes {
	Dimesions = 1,
	Curves = 2,
	Corners = 3,
	Egdes = 4,
	Cutouts = 5,
	Layout = 6,
	Quote = 7,
	Text = 8,
	Select = 9,
	Package = 10,
}

export const defaultCursorByTab: Record<DrawingTab, CursorTypes> = {
	[DrawingTab.Dimensions]: CursorTypes.Dimesions,
	[DrawingTab.Shape]: CursorTypes.Curves,
	[DrawingTab.Edges]: CursorTypes.Egdes,
	[DrawingTab.Cutouts]: CursorTypes.Cutouts,
	[DrawingTab.Layout]: CursorTypes.Layout,
	[DrawingTab.Quote]: CursorTypes.Quote,
};
