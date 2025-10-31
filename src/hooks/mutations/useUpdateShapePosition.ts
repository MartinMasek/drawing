import { api } from "~/utils/api";

/**
 * Hook for updating shape position only (xPos, yPos, rotation).
 * This mutation preserves edges and edge modifications.
 * Use this for drag operations to avoid breaking edge references.
 * 
 * NOTE: Do not call this for shapes with temp IDs - handle those at the call site
 * using registerPendingUpdate() and manual cache updates.
 */
export function useUpdateShapePosition(designId: string | undefined) {
	const utils = api.useUtils();

	const mutation = api.design.updateShapePosition.useMutation({
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
										...(updatedShape.rotation !== undefined && {
											rotation: updatedShape.rotation,
										}),
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
		onSuccess: (data, variables, context) => {
			// Update cache with actual server response
			if (!designId) return;

			const currentData = utils.design.getById.getData({ id: designId });
			if (currentData) {
				utils.design.getById.setData(
					{ id: designId },
					{
						...currentData,
						shapes: currentData.shapes.map((shape) =>
							shape.id === variables.shapeId
								? {
										...shape,
										xPos: data.xPos,
										yPos: data.yPos,
										...(data.rotation !== undefined && {
											rotation: data.rotation,
										}),
										// Keep existing points (server returns them but we don't replace)
										points: shape.points,
									}
								: shape,
						),
					},
				);
			}
		},
	});

	return mutation;
}

