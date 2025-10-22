import { useCallback, useRef } from "react";
import { useShape } from "~/components/header/context/ShapeContext";
import { api } from "~/utils/api";
import type { EdgeShapePosition } from "@prisma/client";

export const useUpdateEdgeModificationPositionDebounced = (designId: string | undefined) => {
    const utils = api.useUtils();
    const { selectedShape, setSelectedShape, selectedEdge, setSelectedEdge } = useShape();
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const pendingUpdateRef = useRef<EdgeShapePosition | null>(null);

    // Function to perform optimistic update immediately
    const performOptimisticUpdate = useCallback((edgeModificationId: string, position: EdgeShapePosition) => {
        if (!designId) return;

        // Update cache immediately
        const previousData = utils.design.getById.getData({ id: designId });
        if (previousData) {
            utils.design.getById.setData(
                { id: designId },
                {
                    ...previousData,
                    shapes: previousData.shapes.map((shape) => ({
                        ...shape,
                        edges: shape.edges.map((edge) => ({
                            ...edge,
                            edgeModifications: edge.edgeModifications.map((mod) =>
                                mod.id === edgeModificationId
                                    ? { ...mod, position }
                                    : mod
                            ),
                        })),
                    })),
                }
            );
        }

        // Update selected edge immediately
        if (selectedEdge) {
            setSelectedEdge({
                ...selectedEdge,
                edgeModification: selectedEdge.edgeModification ? {
                    ...selectedEdge.edgeModification,
                    position,
                } : undefined,
            });
        }

        // Update selected shape immediately
        if (selectedShape) {
            const updatedShape = {
                ...selectedShape,
                edges: selectedShape.edges.map((edge) => ({
                    ...edge,
                    edgeModifications: edge.edgeModifications.map((mod) =>
                        mod.id === edgeModificationId
                            ? { ...mod, position }
                            : mod
                    )
                })),
            };
            setSelectedShape(updatedShape);
        }
    }, [designId, utils, selectedEdge, setSelectedEdge, selectedShape, setSelectedShape]);

    const mutation = api.design.edgeModificationUpdatePosition.useMutation({
        onSuccess: () => {
            // The optimistic update already shows the correct data, and the server confirms it
            // No additional action needed - the cache already has the correct data
        },
    });

    const updatePosition = useCallback((edgeModificationId: string, position: EdgeShapePosition) => {
        // Perform optimistic update immediately
        performOptimisticUpdate(edgeModificationId, position);

        // Clear any existing timeout
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        // Store the pending update
        pendingUpdateRef.current = position;

        // Set up new debounced mutation
        debounceTimeoutRef.current = setTimeout(() => {
            if (pendingUpdateRef.current) {
                mutation.mutate({
                    edgeModificationId,
                    position: pendingUpdateRef.current,
                });
                pendingUpdateRef.current = null;
            }
        }, 300); // 300ms debounce delay
    }, [mutation, performOptimisticUpdate]);

    return {
        updatePosition,
        isLoading: mutation.isPending,
        error: mutation.error,
    };
};
