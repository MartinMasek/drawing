import { api } from "~/utils/api";
import { isTempShapeId, registerPendingUpdate } from "./useCreateShape";

/**
 * Hook for updating shapes (position and points) with optimistic updates.
 * Updates cache immediately for smooth interactions.
 * Handles temp IDs by registering pending updates instead of calling server.
 */
export function useUpdateShape(designId: string | undefined) {
	const utils = api.useUtils();

	const mutation = api.design.updateShape.useMutation({
		onMutate: async (updatedShape) => {
			if (!designId) return { previousData: undefined, isTempId: false };

			// Check if this is a temp ID (shape being created)
			const isTempId = isTempShapeId(updatedShape.shapeId);

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
										...(updatedShape.rotation !== undefined && {
											rotation: updatedShape.rotation,
										}),
									}
								: shape,
						),
					},
				);

				// If this is a temp ID, register pending update instead of calling server
				if (isTempId) {
					registerPendingUpdate(updatedShape.shapeId, {
						xPos: updatedShape.xPos,
						yPos: updatedShape.yPos,
						rotation: updatedShape.rotation,
					});
				}
			}

			return { previousData, isTempId };
		},
		onError: (err, updatedShape, context) => {
			// Only revert on error if this wasn't a temp ID
			// (temp ID errors are expected since server doesn't know about them yet)
			if (context?.previousData && designId && !context.isTempId) {
				utils.design.getById.setData({ id: designId }, context.previousData);
			}
		},
	});

	return mutation;
}

