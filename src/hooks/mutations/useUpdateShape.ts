import { api } from "~/utils/api";

/**
 * Hook for updating shapes (position and points) with optimistic updates.
 * Updates cache immediately for smooth interactions.
 * NOTE: Do not call this for shapes with temp IDs - handle those at the call site
 * using registerPendingUpdate() and manual cache updates.
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
										// Preserve existing point IDs and update coordinates
										// Handle cases where number of points might change
										points: updatedShape.points.map((newPoint, index) => {
											const existingPoint = shape.points[index];
											// If we have an existing point, preserve its ID and update coordinates
											// If we don't have an existing point (new point), create a temporary ID
											return existingPoint
												? {
														...existingPoint,
														xPos: newPoint.xPos,
														yPos: newPoint.yPos,
													}
												: {
														id: `temp-point-${Date.now()}-${index}`,
														xPos: newPoint.xPos,
														yPos: newPoint.yPos,
													};
										}),
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
			// Update cache with actual server response (includes new point IDs)
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
										// Use the real points from server response (with new IDs)
										points: data.points,
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
