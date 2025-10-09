import { createContext, useContext, useMemo, useState } from "react";


export type Shape = {
	id: string
	area: number
	materialId?: string
}

type ShapeContextType = {
    selectedShape: Shape | null;
	setSelectedShape: (shape: Shape | null) => void;
}

const ShapeContext = createContext<ShapeContextType | null>(null);
export const ShapeProvider = ({
	children,
}: { children: React.ReactNode }) => {
	
    const [selectedShape, setSelectedShape] = useState<Shape | null>(null);

    
    const value = useMemo<ShapeContextType>(
		() => ({
            selectedShape,
            setSelectedShape,
		}),
		[
            selectedShape,
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
