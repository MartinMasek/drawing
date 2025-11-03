import { api } from "~/utils/api";
import type { CanvasShape, MaterialExtended } from "~/types/drawing";
import { useShape } from "~/context/ShapeContext";
import { useDrawing } from "~/context/DrawingContext";

/**
 * Hook for setting material to shapes with optimistic updates.
 * Updates cache immediately for smooth interactions.
 */
interface UseSetMaterialToShapeProps {
	material: MaterialExtended | null;
}

export function useSetMaterialToShape({
	material,
}: UseSetMaterialToShapeProps) {
	const { designId } = useDrawing();

	const utils = api.useUtils();

	const { materials, selectedShape, setSelectedShape } = useShape();

	const mutation = api.design.setMaterialToShape.useMutation({
		onMutate: async ({ id, materialId }) => {
			if (!designId) return { previousData: undefined };

			let materialToSet = material;

			if (materialToSet === null) {
				materialToSet = materials.find((m) => m.id === materialId) ?? null;
			}

			if (materialId === null) {
				materialToSet = null;
			}

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
							shape.id === id
								? {
										...shape,
										material: materialToSet ? materialToSet : undefined,
									}
								: shape,
						),
					},
				);
			}

			// Update selected shape in context
			if (selectedShape && selectedShape.id === id) {
				setSelectedShape({
					...selectedShape,
					material: materialToSet ?? undefined,
				} as CanvasShape);
			}

			return { previousData };
		},
	});

	return mutation;
}
