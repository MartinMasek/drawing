import { api } from "~/utils/api";
import type { CanvasShape } from "~/types/drawing";

// Store pending updates for shapes that are being created
const pendingUpdates = new Map<string, {
	xPos: number;
	yPos: number;
	rotation?: number;
}>();

/**
 * Hook for creating shapes with optimistic updates.
 * Automatically updates the cache and handles errors.
 */
export function useCreateShape(designId: string | undefined) {
	const utils = api.useUtils();

	const mutation = api.design.createShape.useMutation({
		onMutate: async (newShape) => {
			if (!designId) return { previousData: undefined, tempId: undefined };

			// Cancel outgoing refetches
			await utils.design.getById.cancel({ id: designId });

			// Snapshot the previous value
			const previousData = utils.design.getById.getData({ id: designId });

			// Create temporary ID for optimistic update
			const tempId = `temp-${Date.now()}`;

			// Optimistically update the cache
			if (previousData) {
				const optimisticShape: CanvasShape = {
					id: tempId,
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

			return { previousData, tempId };
		},
		onError: (err, newShape, context) => {
			// Revert on error
			if (context?.previousData && designId) {
				utils.design.getById.setData({ id: designId }, context.previousData);
			}
		},
		onSuccess: (data, variables, context) => {
			// Update temp ID with real server ID and apply pending updates
			if (!designId || !context?.tempId) return;

			const currentData = utils.design.getById.getData({ id: designId });
			if (currentData) {
				// Check if there are pending updates for this temp ID
				const pending = pendingUpdates.get(context.tempId);
				
				utils.design.getById.setData(
					{ id: designId },
					{
						...currentData,
						shapes: currentData.shapes.map((shape) =>
							shape.id === context.tempId
								? {
										...shape,
										id: data.id, // Replace temp ID with real ID from server
										// Apply pending updates if any
										...(pending && {
											xPos: pending.xPos,
											yPos: pending.yPos,
											...(pending.rotation !== undefined && { rotation: pending.rotation }),
										}),
									}
								: shape,
						),
					},
				);
				
				// Clean up pending updates
				pendingUpdates.delete(context.tempId);
			}
		},
	});

	return mutation;
}

/**
 * Check if a shape ID is a temporary ID (not yet persisted to server)
 */
export function isTempShapeId(shapeId: string): boolean {
	return shapeId.startsWith('temp-');
}

/**
 * Register a pending update for a shape that's being created
 */
export function registerPendingUpdate(
	tempId: string,
	update: { xPos: number; yPos: number; rotation?: number }
): void {
	pendingUpdates.set(tempId, update);
}
