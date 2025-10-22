import { useCallback, useRef } from "react";
import { useShape } from "~/components/header/context/ShapeContext";
import { api } from "~/utils/api";

export const useUpdateEdgeModificationDistanceDebounced = (designId: string | undefined) => {
    const utils = api.useUtils();
    const { selectedShape, setSelectedShape, selectedEdge, setSelectedEdge } = useShape();
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const pendingUpdateRef = useRef<number | null>(null);

    // Function to perform optimistic update immediately
    const performOptimisticUpdate = useCallback((edgeModificationId: string, distance: number) => {
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
                                    ? { ...mod, distance }
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
                    distance,
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
                            ? { ...mod, distance }
                            : mod
                    )
                })),
            };
            setSelectedShape(updatedShape);
        }
    }, [designId, utils, selectedEdge, setSelectedEdge, selectedShape, setSelectedShape]);

    const mutation = api.design.edgeModificationUpdateDistance.useMutation({
        onSuccess: () => {
            // The optimistic update already shows the correct data, and the server confirms it
            // No additional action needed - the cache already has the correct data
        },
    });

    const updateDistance = useCallback((edgeModificationId: string, distance: number) => {
        // Perform optimistic update immediately
        performOptimisticUpdate(edgeModificationId, distance);

        // Clear any existing timeout
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        // Store the pending update
        pendingUpdateRef.current = distance;

        // Set up new debounced mutation
        debounceTimeoutRef.current = setTimeout(() => {
            if (pendingUpdateRef.current !== null) {
                mutation.mutate({
                    edgeModificationId,
                    distance: pendingUpdateRef.current,
                });
                pendingUpdateRef.current = null;
            }
        }, 300); // 300ms debounce delay
    }, [mutation, performOptimisticUpdate]);

    return {
        updateDistance,
        isLoading: mutation.isPending,
        error: mutation.error,
    };
};
