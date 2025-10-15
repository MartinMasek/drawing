import { api } from "~/utils/api";

/**
 * Hook for updating shapes (position and points) with optimistic updates.
 * Updates cache immediately for smooth interactions.
 */
export function useUpdateShape(designId: string | undefined) {
	const utils = api.useUtils();

	const mutation = api.design.updateShape.useMutation({
		onMutate: async (updatedShape) => {
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
							shape.id === updatedShape.shapeId
								? {
										...shape,
										xPos: updatedShape.xPos,
										yPos: updatedShape.yPos,
										points: updatedShape.points,
									}
								: shape,
						),
					},
				);
			}

			return { previousData };
		},
		onError: (err, updatedShape, context) => {
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

