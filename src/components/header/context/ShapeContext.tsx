import { createContext, useContext, useMemo, useState } from "react";
import type { CanvasShape } from "~/types/drawing";

type ShapeContextType = {
	selectedShape: CanvasShape | null;
	setSelectedShape: (shape: CanvasShape | null) => void;
};

const ShapeContext = createContext<ShapeContextType | null>(null);
export const ShapeProvider = ({ children }: { children: React.ReactNode }) => {
	const [selectedShape, setSelectedShape] = useState<CanvasShape | null>(null);

	const value = {
		selectedShape,
		setSelectedShape,
	};

	return (
		<ShapeContext.Provider value={value}>{children}</ShapeContext.Provider>
	);
};

export const useShape = () => {
	const ctx = useContext(ShapeContext);
	if (!ctx) throw new Error("useShape must be used inside ShapeProvider");
	return ctx;
};
