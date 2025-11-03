import { useCallback } from "react";
import { useShape } from "~/context/ShapeContext";
import { api } from "~/utils/api";
import { useDebouncedCallback } from "use-debounce";
import { DEBOUNCE_DELAY } from "~/utils/canvas-constants";

const useUpdateCornerClipDebounced = (designId: string | undefined) => {
    const utils = api.useUtils();
    const { selectedShape, setSelectedShape, selectedCorner, setSelectedCorner } = useShape();

    const performOptimisticUpdate = useCallback((cornerId: string, clip: number) => {
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
                            corner.id === cornerId ? { ...corner, clip: clip } : corner
                        ),
                    })),
                }
            );
        }

        if (selectedCorner) {
            setSelectedCorner({
                ...selectedCorner,
                clip: clip,
            });
        }

        if (selectedShape) {
            setSelectedShape({
                ...selectedShape,
                corners: selectedShape.corners.map((corner) => corner.id === cornerId ? { ...corner, clip: clip } : corner),
            });
        }
    }, [designId, utils, selectedCorner, setSelectedCorner, selectedShape, setSelectedShape]);

    const mutation = api.design.updateCornerClip.useMutation({
        onSuccess: () => {
            // The optimistic update already shows the correct data, and the server confirms it
            // No additional action needed - the cache already has the correct data
        },
    });

    const debouncedMutation = useDebouncedCallback(
        (cornerId: string, clip: number) => {
            mutation.mutate({
                cornerId,
                clip,
            });
        },
        DEBOUNCE_DELAY
    );

    const updateClip = useCallback((cornerId: string, clip: number) => {
        performOptimisticUpdate(cornerId, clip);
        debouncedMutation(cornerId, clip);
    }, [performOptimisticUpdate, debouncedMutation]);

    return {
        updateClip,
        isLoading: mutation.isPending,
        error: mutation.error,
    };
};

export default useUpdateCornerClipDebounced;