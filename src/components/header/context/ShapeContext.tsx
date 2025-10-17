import { createContext, useContext, useState } from "react";
import type { CanvasShape, MaterialExtended } from "~/types/drawing";

type ShapeContextType = {
	selectedShape: CanvasShape | null;
	setSelectedShape: (shape: CanvasShape | null) => void;
	materials: MaterialExtended[];
	setMaterials: (materials: MaterialExtended[]) => void;
	getNumberOfShapesPerMaterial: (materialId?: string) => number;
	selectedMaterial: MaterialExtended | null;
	setSelectedMaterial: (material: MaterialExtended | null) => void;
	getAllShapesWithMaterial: (materialId?: string) => CanvasShape[];
};

const ShapeContext = createContext<ShapeContextType | null>(null);
export const ShapeProvider = ({
	children,
	shapes,
}: {
	children: React.ReactNode;
	shapes?: ReadonlyArray<CanvasShape>;
}) => {
	const [selectedShape, setSelectedShape] = useState<CanvasShape | null>(null);
	const [selectedMaterial, setSelectedMaterial] =
		useState<MaterialExtended | null>(null);

	// All material ids that are applied to the shapes
	const [materials, setMaterials] = useState<MaterialExtended[]>(() => {
		if (!shapes) return [];
		return shapes
			.filter(
				(shape): shape is CanvasShape & { material: MaterialExtended } =>
					shape.material !== undefined,
			)
			.map((shape) => shape.material)
			.filter(
				(material, index, array) =>
					array.findIndex((m) => m.id === material.id) === index,
			);
	});

	const getNumberOfShapesPerMaterial = (materialId?: string): number => {
		// If no materialId is provided, return the number of shapes without a material
		if (!materialId) {
			return (
				shapes?.filter((shape) => shape.material === undefined).length ?? 0
			);
		}
		return (
			shapes?.filter((shape) => shape.material?.id === materialId).length ?? 0
		);
	};

	const getAllShapesWithMaterial = (materialId?: string): CanvasShape[] => {
		if (!materialId) {
			return shapes?.filter((shape) => shape.material === undefined) ?? [];
		}
		return shapes?.filter((shape) => shape.material?.id === materialId) ?? [];
	};

	const value = {
		selectedShape,
		setSelectedShape,
		materials,
		setMaterials,
		getNumberOfShapesPerMaterial,
		selectedMaterial,
		setSelectedMaterial,
		getAllShapesWithMaterial,
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
