export enum DrawingTab {
    Dimensions = 1,
    Shape = 2,
    Edges = 3,
    Cutouts = 4,
    Layout = 5,
    Quote = 6,
}
export const DrawingTabList: { id: DrawingTab; label: string }[] = [
    { id: DrawingTab.Dimensions, label: 'Dimensions' },
    { id: DrawingTab.Shape, label: 'Shape' },
    { id: DrawingTab.Edges, label: 'Edges' },
    { id: DrawingTab.Cutouts, label: 'Cutouts' },
    { id: DrawingTab.Layout, label: 'Layout' },
    { id: DrawingTab.Quote, label: 'Quote' },
]
