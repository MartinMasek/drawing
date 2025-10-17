import { api } from "~/utils/api";
import type { CanvasShape, MaterialExtended } from "~/types/drawing";
import { useShape } from "~/components/header/context/ShapeContext";

/**
 * Hook for removing material from shapes with optimistic updates.
 * Updates cache immediately for smooth interactions.
 */
export function useRemoveMaterialFromShapes() {
	const utils = api.useUtils();

	const { materials, selectedShape, setSelectedShape, setMaterials } =
		useShape();

	const mutation = api.design.removeMaterialFromShapes.useMutation({
		onMutate: async ({ materialId, designId }) => {
			if (!designId) return { previousData: undefined };

			// Get all shapes that have the material
			const shapesWithMaterial = materials.filter(
				(material) => material.id === materialId,
			);

			// Cancel outgoing refetches
			await utils.design.getById.cancel({ id: designId });

			// Snapshot the previous value
			const previousData = utils.design.getById.getData({ id: designId });

			// Optimistically update the cache
			if (previousData) {
				utils.design.getById.setData(
					{ id: designId },
					{
						...previousData,
						shapes: previousData.shapes.map((shape) =>
							shapesWithMaterial.includes(shape.material as MaterialExtended)
								? {
										...shape,
										material: undefined,
									}
								: shape,
						),
					},
				);
			}

			// Update selected shape in context
			if (selectedShape) {
				setSelectedShape({
					...selectedShape,
					material: undefined,
				} as CanvasShape);
			}

			// Remove the material from the materials array
			setMaterials(materials.filter((material) => material.id !== materialId));

			return { previousData };
		},
	});

	return mutation;
}
