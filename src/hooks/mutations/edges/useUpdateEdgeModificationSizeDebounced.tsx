import { useCallback, useRef } from "react";
import { useShape } from "~/components/header/context/ShapeContext";
import { api } from "~/utils/api";

export const useUpdateEdgeModificationSizeDebounced = (designId: string | undefined) => {
    const utils = api.useUtils();
    const { selectedShape, setSelectedShape, selectedEdge, setSelectedEdge } = useShape();
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const pendingUpdateRef = useRef<{ depth: number; width: number } | null>(null);

    // Function to perform optimistic update immediately
    const performOptimisticUpdate = useCallback((edgeModificationId: string, depth: number, width: number) => {
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
                                    ? { ...mod, depth, width }
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
                    depth,
                    width,
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
                            ? { ...mod, depth, width }
                            : mod
                    )
                })),
            };
            setSelectedShape(updatedShape);
        }
    }, [designId, utils, selectedEdge, setSelectedEdge, selectedShape, setSelectedShape]);

    const mutation = api.design.edgeModificationUpdateSize.useMutation({
        onSuccess: () => {
            // The optimistic update already shows the correct data, and the server confirms it
            // No additional action needed - the cache already has the correct data
        },
    });

    const updateSize = useCallback((edgeModificationId: string, depth: number, width: number) => {
        // Perform optimistic update immediately
        performOptimisticUpdate(edgeModificationId, depth, width);

        // Clear any existing timeout
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        // Store the pending update
        pendingUpdateRef.current = { depth, width };

        // Set up new debounced mutation
        debounceTimeoutRef.current = setTimeout(() => {
            if (pendingUpdateRef.current) {
                mutation.mutate({
                    edgeModificationId,
                    depth: pendingUpdateRef.current.depth,
                    width: pendingUpdateRef.current.width,
                });
                pendingUpdateRef.current = null;
            }
        }, 300); // 300ms debounce delay
    }, [mutation, performOptimisticUpdate]);

    return {
        updateSize,
        isLoading: mutation.isPending,
        error: mutation.error,
    };
};
