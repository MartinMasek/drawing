import { api } from "~/utils/api";
import type { CanvasShape } from "~/types/drawing";
import { getShapeEdgePointIndices } from "~/utils/shape-utils";

// Store pending updates for shapes that are being created
const pendingUpdates = new Map<
	string,
	{
		xPos: number;
		yPos: number;
		rotation?: number;
		points: { id: string; xPos: number; yPos: number }[];
	}
>();

/**
 * Hook for creating shapes with optimistic updates.
 * Automatically updates the cache and handles errors.
 */
export function useCreateShape(designId: string | undefined) {
	const utils = api.useUtils();

	const mutation = api.design.createShape.useMutation({
		onMutate: async (newShape) => {
			if (!designId)
				return {
					previousData: undefined,
					tempId: undefined,
					clientId: undefined,
				};

			// Cancel outgoing refetches
			await utils.design.getById.cancel({ id: designId });

			// Snapshot the previous value
			const previousData = utils.design.getById.getData({ id: designId });

			// Create temporary ID and stable client ID for optimistic update
			// tempId: Used for identifying the shape in cache updates until server responds
			// clientId: Stable ID that persists across temp->real ID transition to prevent React remounting
			const tempId = `temp-${Date.now()}`;
			const clientId = `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

			// Optimistically update the cache
			if (previousData) {
				const optimisticShape: CanvasShape = {
					id: tempId,
					clientId: clientId, // Critical: This stays the same when tempId becomes real ID
					xPos: newShape.xPos,
					yPos: newShape.yPos,
					rotation: newShape.rotation ?? 0,
					points: newShape.points.map((point) => ({
						id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
						xPos: point.xPos,
						yPos: point.yPos,
					})),
					edges: [],
					// Pre-calculate edge indices for immediate visualization
					edgeIndices: getShapeEdgePointIndices(newShape.points),
				};

				utils.design.getById.setData(
					{ id: designId },
					{
						...previousData,
						shapes: [...previousData.shapes, optimisticShape],
					},
				);
			}

			return { previousData, tempId, clientId };
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
										// IMPORTANT: Preserve clientId so React doesn't remount the component
										// This is critical if user is dragging the shape during this transition
										clientId: context.clientId,
										// Use edge indices from server response (already calculated)
										edgeIndices: data.edgeIndices,
										// Apply pending updates if any, otherwise use server data
										...(pending && {
											xPos: pending.xPos,
											yPos: pending.yPos,
											...(pending.rotation !== undefined && {
												rotation: pending.rotation,
											}),
											points: pending.points,
										}),
										// If no pending updates, use the real points from server
										...(!pending && {
											points: data.points,
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
	return shapeId.startsWith("temp-");
}

/**
 * Register a pending update for a shape that's being created
 */
export function registerPendingUpdate(
	tempId: string,
	update: {
		xPos: number;
		yPos: number;
		rotation?: number;
		points: { id: string; xPos: number; yPos: number }[];
	},
): void {
	pendingUpdates.set(tempId, update);
}
