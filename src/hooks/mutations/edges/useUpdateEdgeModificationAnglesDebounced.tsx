import { useCallback } from "react";
import { useShape } from "~/components/header/context/ShapeContext";
import { api } from "~/utils/api";
import { useDebounceCallback } from "usehooks-ts";
import { DEBOUNCE_DELAY } from "~/utils/canvas-constants";

export const useUpdateEdgeModificationAnglesDebounced = (designId: string | undefined) => {
    const utils = api.useUtils();
    const { selectedShape, setSelectedShape, selectedEdge, setSelectedEdge } = useShape();

    // Function to perform optimistic update immediately
    const performOptimisticUpdate = useCallback((edgeModificationId: string, sideAngleLeft: number, sideAngleRight: number) => {
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
                                    ? { ...mod, sideAngleLeft, sideAngleRight }
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
                    sideAngleLeft,
                    sideAngleRight,
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
                            ? { ...mod, sideAngleLeft, sideAngleRight }
                            : mod
                    )
                })),
            };
            setSelectedShape(updatedShape);
        }
    }, [designId, utils, selectedEdge, setSelectedEdge, selectedShape, setSelectedShape]);

    const mutation = api.design.edgeModificationUpdateAngles.useMutation({
        onSuccess: () => {
            // The optimistic update already shows the correct data, and the server confirms it
            // No additional action needed - the cache already has the correct data
        },
    });

    // Debounced function for the actual mutation
    const debouncedMutation = useDebounceCallback(
        (edgeModificationId: string, left: number, right: number) => {
            mutation.mutate({
                edgeModificationId,
                sideAngleLeft: left,
                sideAngleRight: right,
            });
        },
        DEBOUNCE_DELAY
    );

    const updateAngles = useCallback((edgeModificationId: string, left: number, right: number) => {
        // Perform optimistic update immediately
        performOptimisticUpdate(edgeModificationId, left, right);

        // Trigger debounced mutation
        debouncedMutation(edgeModificationId, left, right);
    }, [performOptimisticUpdate, debouncedMutation]);

    return {
        updateAngles,
        isLoading: mutation.isPending,
        error: mutation.error,
    };
};
