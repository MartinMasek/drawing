import { api } from "~/utils/api";
import type { CanvasShape } from "~/types/drawing";
import { useShape } from "~/context/ShapeContext";

/**
 * Hook for setting material to shapes without material with optimistic updates.
 * Updates cache immediately for smooth interactions.
 */
export function useSetMaterialToShapesWithoutMaterial() {
	const utils = api.useUtils();
	const { selectedShape, setSelectedShape, selectedMaterial } = useShape();

	const mutation = api.design.setMaterialToShapesWithoutMaterial.useMutation({
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
						shapes: previousData.shapes.map((shape) =>
							shape.material === undefined
								? {
										...shape,
										material: selectedMaterial ? selectedMaterial : undefined,
									}
								: shape,
						),
					},
				);
			}

			// Update selected shape in context
			if (selectedShape && selectedShape.material === undefined) {
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
