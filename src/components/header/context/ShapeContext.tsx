import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useDrawing } from "./DrawingContext";


type Shape = {
	id: string
	area: number
	materialId?: string
}

type ShapeContextType = {
    selectedShape: Shape | null;
	setSelectedShape: (shape: Shape | null) => void;
	allShapes: Shape[],
	setAllShapes: (shapes: Shape[]) => void
	updateShape: (id: string, updates: Partial<Shape>) => void;
}

const ShapeContext = createContext<ShapeContextType | null>(null);
export const ShapeProvider = ({
	children,
}: { children: React.ReactNode }) => {
	
	const { activeTab } = useDrawing()
    const [allShapes, setAllShapes] = useState<Shape[]>([]);
    const [selectedShape, setSelectedShape] = useState<Shape | null>(null);

	// When tab changes, reset selected shape
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(()=>{
		setSelectedShape(null)
	},[activeTab])
		

	// Function to update a shape by id
	const updateShape = (selectedShapeId: string, updates: Partial<Shape>) => {
		if (selectedShape?.id === selectedShapeId) {
			setSelectedShape(prev => (prev ? { ...prev, ...updates } : prev));
		
			setAllShapes(prevShapes =>
				prevShapes.map(shape =>
					shape.id === selectedShapeId ? { ...shape, ...updates } : shape
				)
			);		
		}
	};

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    const value = useMemo<ShapeContextType>(
		() => ({
            selectedShape,
            setSelectedShape,
			allShapes,
			setAllShapes,
			updateShape
		}),
		[
            selectedShape,
			allShapes,
		],
	);
	return (
		<ShapeContext.Provider value={value}>{children}</ShapeContext.Provider>
	);
}

export const useShape = () => {
	const ctx = useContext(ShapeContext);
	if (!ctx) throw new Error("useShape must be used inside ShapeProvider");
	return ctx;
};
