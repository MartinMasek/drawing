import { useCallback } from "react";
import { useShape } from "~/components/header/context/ShapeContext";
import { api } from "~/utils/api";
import { useDebouncedCallback } from "use-debounce";
import { DEBOUNCE_DELAY } from "~/utils/canvas-constants";

export const useUpdateEdgeModificationSizeDebounced = (designId: string | undefined) => {
    const utils = api.useUtils();
    const { selectedShape, setSelectedShape, selectedEdge, setSelectedEdge } = useShape();

    const mutation = api.design.edgeModificationUpdateSize.useMutation();

    const performOptimisticUpdate = useCallback((edgeModificationId: string, depth: number, width: number) => {
        if (!designId) return;

        const previousData = utils.design.getById.getData({ id: designId });
        if (previousData) {
            utils.design.getById.setData(
                { id: designId },
                {
                    ...previousData,
                    shapes: previousData.shapes.map(shape => ({
                        ...shape,
                        edges: shape.edges.map(edge => ({
                            ...edge,
                            edgeModifications: edge.edgeModifications.map(mod =>
                                mod.id === edgeModificationId ? { ...mod, depth, width } : mod
                            ),
                        })),
                    })),
                }
            );
        }

        if (selectedEdge) {
            setSelectedEdge({
                ...selectedEdge,
                edgeModification: selectedEdge.edgeModification
                    ? { ...selectedEdge.edgeModification, depth, width }
                    : undefined,
            });
        }

        if (selectedShape) {
            const updatedShape = {
                ...selectedShape,
                edges: selectedShape.edges.map(edge => ({
                    ...edge,
                    edgeModifications: edge.edgeModifications.map(mod =>
                        mod.id === edgeModificationId ? { ...mod, depth, width } : mod
                    ),
                })),
            };
            setSelectedShape(updatedShape);
        }
    }, [designId, utils, selectedEdge, setSelectedEdge, selectedShape, setSelectedShape]);

    // Stable debounced function
    const debouncedMutation = useDebouncedCallback(
        (edgeModificationId: string, depth: number, width: number) => {
            mutation.mutate({ edgeModificationId, depth, width });
        },
        DEBOUNCE_DELAY
    );

    const updateSize = useCallback((edgeModificationId: string, depth: number, width: number) => {
        performOptimisticUpdate(edgeModificationId, depth, width);
        debouncedMutation(edgeModificationId, depth, width);
    }, [performOptimisticUpdate, debouncedMutation]);

    return { updateSize, isLoading: mutation.isPending, error: mutation.error };
};
