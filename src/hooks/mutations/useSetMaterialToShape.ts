import { api } from "~/utils/api";
import type { CanvasShape } from "~/types/drawing";
import { useRouter } from "next/router";
import { useShape } from "~/components/header/context/ShapeContext";

/**
 * Hook for setting material to shapes with optimistic updates.
 * Updates cache immediately for smooth interactions.
 */
export function useSetMaterialToShape() {
	const router = useRouter();
	const idParam = router.query.id;
	const designId = Array.isArray(idParam) ? idParam[0] : idParam;
	const utils = api.useUtils();

	const { materials, selectedShape, setSelectedShape } = useShape();

	const mutation = api.design.setMaterialToShape.useMutation({
		onMutate: async ({ id, materialId }) => {
			if (!designId) return { previousData: undefined };
			let material = null;

			if (materialId) {
				material = materials.find((m) => m.id === materialId);
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
										material: material ? material : undefined,
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
					material: material ?? undefined,
				} as CanvasShape);
			}

			return { previousData };
		},
	});

	return mutation;
}
