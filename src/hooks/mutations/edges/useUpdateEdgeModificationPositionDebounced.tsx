import { useCallback } from "react";
import { useShape } from "~/components/header/context/ShapeContext";
import { api } from "~/utils/api";
import type { EdgeShapePosition } from "@prisma/client";
import { useDebouncedCallback } from "use-debounce";
import { DEBOUNCE_DELAY } from "~/utils/canvas-constants";

export const useUpdateEdgeModificationPositionDebounced = (designId: string | undefined) => {
    const utils = api.useUtils();
    const { selectedShape, setSelectedShape, selectedEdge, setSelectedEdge } = useShape();

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

    // Debounced function for the actual mutation
    const debouncedMutation = useDebouncedCallback(
        (edgeModificationId: string, position: EdgeShapePosition) => {
            mutation.mutate({
                edgeModificationId,
                position,
            });
        },
        DEBOUNCE_DELAY
    );

    const updatePosition = useCallback((edgeModificationId: string, position: EdgeShapePosition) => {
        // Perform optimistic update immediately
        performOptimisticUpdate(edgeModificationId, position);

        // Trigger debounced mutation
        debouncedMutation(edgeModificationId, position);
    }, [performOptimisticUpdate, debouncedMutation]);

    return {
        updatePosition,
        isLoading: mutation.isPending,
        error: mutation.error,
    };
};
