import { useCallback } from "react";
import { useShape } from "~/components/header/context/ShapeContext";
import { api } from "~/utils/api";
import { useDebouncedCallback } from "use-debounce";
import { DEBOUNCE_DELAY } from "~/utils/canvas-constants";

const useUpdateCornerDepthDebounced = (designId: string | undefined) => {
    const utils = api.useUtils();
    const { selectedShape, setSelectedShape, selectedCorner, setSelectedCorner } = useShape();

    const performOptimisticUpdate = useCallback((cornerId: string, depth: number) => {
        if (!designId) return;

        const previousData = utils.design.getById.getData({ id: designId });
        if (previousData) {
            utils.design.getById.setData(
                { id: designId },
                {
                    ...previousData,
                    shapes: previousData.shapes.map((shape) => ({
                        ...shape,
                        corners: shape.corners.map((corner) =>
                            corner.id === cornerId ? { ...corner, modificationDepth: depth } : corner
                        ),
                    })),
                }
            );
        }

        if (selectedCorner) {
            setSelectedCorner({
                ...selectedCorner,
                modificationDepth: depth,
            });
        }

        if (selectedShape) {
            setSelectedShape({
                ...selectedShape,
                corners: selectedShape.corners.map((corner) => corner.id === cornerId ? { ...corner, modificationDepth: depth } : corner),
            });
        }
    }, [designId, utils, selectedCorner, setSelectedCorner, selectedShape, setSelectedShape]);

    const mutation = api.design.updateCornerDepth.useMutation({
        onSuccess: () => {
            // The optimistic update already shows the correct data, and the server confirms it
            // No additional action needed - the cache already has the correct data
        },
    });

    const debouncedMutation = useDebouncedCallback(
        (cornerId: string, depth: number) => {
            mutation.mutate({
                cornerId,
                depth,
            });
        },
        DEBOUNCE_DELAY
    );

    const updateDepth = useCallback((cornerId: string, depth: number) => {
        performOptimisticUpdate(cornerId, depth);
        debouncedMutation(cornerId, depth);
    }, [performOptimisticUpdate, debouncedMutation]);

    return {
        updateDepth,
        isLoading: mutation.isPending,
        error: mutation.error,
    };
};

export default useUpdateCornerDepthDebounced;