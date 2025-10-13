import { api } from "~/utils/api";
import type { CanvasShape } from "~/types/drawing";

/**
 * Hook for creating shapes with optimistic updates.
 * Automatically updates the cache and handles errors.
 */
export function useCreateShape(designId: string | undefined) {
	const utils = api.useUtils();

	const mutation = api.design.createShape.useMutation({
		onMutate: async (newShape) => {
			if (!designId) return { previousData: undefined };

			// Cancel outgoing refetches
			await utils.design.getById.cancel({ id: designId });

			// Snapshot the previous value
			const previousData = utils.design.getById.getData({ id: designId });

			// Optimistically update the cache
			if (previousData) {
				const optimisticShape: CanvasShape = {
					id: `temp-${Date.now()}`, // temporary ID
					xPos: newShape.xPos,
					yPos: newShape.yPos,
					rotation: newShape.rotation ?? 0,
					points: newShape.points,
				};

				utils.design.getById.setData(
					{ id: designId },
					{
						...previousData,
						shapes: [...previousData.shapes, optimisticShape],
					},
				);
			}

			return { previousData };
		},
		onError: (err, newShape, context) => {
			// Revert on error
			if (context?.previousData && designId) {
				utils.design.getById.setData({ id: designId }, context.previousData);
			}
		},
		onSettled: () => {
			// Refetch to ensure sync with server
			if (designId) {
				void utils.design.getById.invalidate({ id: designId });
			}
		},
	});

	return mutation;
}

