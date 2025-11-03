import { useCallback } from "react";
import { useShape } from "~/context/ShapeContext";
import { api } from "~/utils/api";
import { useDebouncedCallback } from "use-debounce";
import { DEBOUNCE_DELAY } from "~/utils/canvas-constants";

const useUpdateCornerRadiusDebounced = (designId: string | undefined) => {
    const utils = api.useUtils();
    const { selectedShape, setSelectedShape, selectedCorner, setSelectedCorner } = useShape();

    const performOptimisticUpdate = useCallback((cornerId: string, radius: number) => {
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
                            corner.id === cornerId ? { ...corner, radius } : corner
                        ),
                    })),
                }
            );
        }

        if (selectedCorner) {
            setSelectedCorner({
                ...selectedCorner,
                radius,
            });
        }

        if (selectedShape) {
            setSelectedShape({
                ...selectedShape,
                corners: selectedShape.corners.map((corner) => corner.id === cornerId ? { ...corner, radius } : corner),
            });
        }
    }, [designId, utils, selectedCorner, setSelectedCorner, selectedShape, setSelectedShape]);

    const mutation = api.design.updateCornerRadius.useMutation({
        onSuccess: () => {
            // The optimistic update already shows the correct data, and the server confirms it
            // No additional action needed - the cache already has the correct data
        },
    });

    const debouncedMutation = useDebouncedCallback(
        (cornerId: string, radius: number) => {
            mutation.mutate({
                cornerId,
                radius,
            });
        },
        DEBOUNCE_DELAY
    );

    const updateRadius = useCallback((cornerId: string, radius: number) => {
        performOptimisticUpdate(cornerId, radius);
        debouncedMutation(cornerId, radius);
    }, [performOptimisticUpdate, debouncedMutation]);

    return {
        updateRadius,
        isLoading: mutation.isPending,
        error: mutation.error,
    };
};

export default useUpdateCornerRadiusDebounced;