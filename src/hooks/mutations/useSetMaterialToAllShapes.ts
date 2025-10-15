import { api } from "~/utils/api";
import type { CanvasShape } from "~/types/drawing";
import { useShape } from "~/components/header/context/ShapeContext";

/**
 * Hook for setting material to all shapes with optimistic updates.
 * Updates cache immediately for smooth interactions.
 */
export function useSetMaterialToAllShapes() {
	const utils = api.useUtils();
	const { selectedShape, setSelectedShape, selectedMaterial } = useShape();

	const mutation = api.design.setMaterialToAllShapes.useMutation({
		onMutate: async ({ materialId, designId }) => {
			if (!designId) return { previousData: undefined };

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
						shapes: previousData.shapes.map((shape) => ({
							...shape,
							material: selectedMaterial ? selectedMaterial : undefined,
						})),
					},
				);
			}

			// Update selected shape in context
			if (selectedShape) {
				setSelectedShape({
					...selectedShape,
					material: selectedMaterial,
				} as CanvasShape);
			}

			return { previousData };
		},
	});

	return mutation;
}
