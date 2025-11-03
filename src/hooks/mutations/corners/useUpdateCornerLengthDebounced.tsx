import { useCallback } from "react";
import { useShape } from "~/components/context/ShapeContext";
import { api } from "~/utils/api";
import { useDebouncedCallback } from "use-debounce";
import { DEBOUNCE_DELAY } from "~/utils/canvas-constants";

const useUpdateCornerLengthDebounced = (designId: string | undefined) => {
    const utils = api.useUtils();
    const { selectedShape, setSelectedShape, selectedCorner, setSelectedCorner } = useShape();

    const performOptimisticUpdate = useCallback((cornerId: string, length: number) => {
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
                            corner.id === cornerId ? { ...corner, modificationLength: length } : corner
                        ),
                    })),
                }
            );
        }

        if (selectedCorner) {
            setSelectedCorner({
                ...selectedCorner,
                modificationLength: length,
            });
        }

        if (selectedShape) {
            setSelectedShape({
                ...selectedShape,
                corners: selectedShape.corners.map((corner) => corner.id === cornerId ? { ...corner, modificationLength: length } : corner),
            });
        }
    }, [designId, utils, selectedCorner, setSelectedCorner, selectedShape, setSelectedShape]);

    const mutation = api.design.updateCornerLength.useMutation({
        onSuccess: () => {
            // The optimistic update already shows the correct data, and the server confirms it
            // No additional action needed - the cache already has the correct data
        },
    });

    const debouncedMutation = useDebouncedCallback(
        (cornerId: string, length: number) => {
            mutation.mutate({
                cornerId,
                length,
            });
        },
        DEBOUNCE_DELAY
    );

    const updateLength = useCallback((cornerId: string, length: number) => {
        performOptimisticUpdate(cornerId, length);
        debouncedMutation(cornerId, length);
    }, [performOptimisticUpdate, debouncedMutation]);

    return {
        updateLength,
        isLoading: mutation.isPending,
        error: mutation.error,
    };
};

export default useUpdateCornerLengthDebounced;