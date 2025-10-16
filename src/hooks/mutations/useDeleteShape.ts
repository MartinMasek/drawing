import { api } from "~/utils/api";

/**
 * Hook for deleting shapes with optimistic updates.
 * Removes shape from cache immediately for smooth UX.
 */
export function useDeleteShape(designId: string | undefined) {
	const utils = api.useUtils();

	return api.design.deleteShape.useMutation({
		onMutate: async (variables) => {
			if (!designId) return { previousData: undefined };

			// Cancel outgoing refetches
			await utils.design.getById.cancel({ id: designId });

			// Snapshot the previous value
			const previousData = utils.design.getById.getData({ id: designId });

			// Optimistically update the cache
			if (previousData) {
				utils.design.getById.setData({ id: designId }, {
					...previousData,
					shapes: previousData.shapes.filter((shape) => shape.id !== variables.shapeId),
				});
			}

			return { previousData };
		},
		onError: (err, variables, context) => {
			// Revert on error
			if (context?.previousData && designId) {
				utils.design.getById.setData({ id: designId }, context.previousData);
			}
		},
	});
}

