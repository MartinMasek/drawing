import { useCallback } from "react";
import { useShape } from "~/context/ShapeContext";
import { api } from "~/utils/api";
import { useDebouncedCallback } from "use-debounce";
import { DEBOUNCE_DELAY } from "~/utils/canvas-constants";


const useUpdateEdgeModificationFullRadiusDebounced = (designId: string | undefined) => {
    const utils = api.useUtils();
    const { selectedShape, setSelectedShape, selectedEdge, setSelectedEdge } = useShape();

    const performOptimisticUpdate = useCallback((edgeModificationId: string, fullRadiusDepth: number) => {
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
                                    ? { ...mod, fullRadiusDepth }
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
                    fullRadiusDepth,
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
                            ? { ...mod, fullRadiusDepth }
                            : mod
                    )
                })),
            };
            setSelectedShape(updatedShape);
        }
    }, [designId, utils, selectedEdge, setSelectedEdge, selectedShape, setSelectedShape]);

    const mutation = api.design.edgeModificationUpdateFullRadiusDepth.useMutation({
        onSuccess: () => {
            // The optimistic update already shows the correct data, and the server confirms it
            // No additional action needed - the cache already has the correct data
        },
    });

    // Debounced function for the actual mutation
    const debouncedMutation = useDebouncedCallback(
        (edgeModificationId: string, fullRadiusDepth: number) => {
            mutation.mutate({
                edgeModificationId,
                fullRadiusDepth,
            });
        },
        DEBOUNCE_DELAY
    );

    const updateFullRadiusDepth = useCallback((edgeModificationId: string, fullRadiusDepth: number) => {
        // Perform optimistic update immediately
        performOptimisticUpdate(edgeModificationId, fullRadiusDepth);

        // Trigger debounced mutation
        debouncedMutation(edgeModificationId, fullRadiusDepth);
    }, [performOptimisticUpdate, debouncedMutation]);

    return {
        updateFullRadiusDepth,
        isLoading: mutation.isPending,
        error: mutation.error,
    };
};

export default useUpdateEdgeModificationFullRadiusDebounced;