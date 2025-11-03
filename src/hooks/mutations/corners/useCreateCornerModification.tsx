import { useShape } from "~/components/context/ShapeContext";
import { api } from "~/utils/api";

const useCreateCornerModification = (designId: string | undefined) => {
    const utils = api.useUtils();
    const { selectedShape, setSelectedShape, selectedCorner, setSelectedCorner } = useShape();

    return api.design.createCornerModification.useMutation({
        onMutate: async (variables) => {
            if (!designId) return { previousData: undefined };

            // Cancel any outgoing refetches
            await utils.design.getById.cancel({ id: designId });

            // Snapshot the previous value
            const previousData = utils.design.getById.getData({ id: designId });

            const tempCornerId = `temp-corner-${Date.now()}`;

            if (previousData) {
                utils.design.getById.setData(
                    { id: designId },
                    { ...previousData, shapes: previousData.shapes.map((shape) => ({ ...shape, corners: [...shape.corners, { id: tempCornerId, ...variables }] })) },
                );
            }

            if (selectedShape && selectedShape.id === variables.shapeId) {
                const optimisticShape = {
                    ...selectedShape,
                    corners: [...selectedShape.corners, { id: tempCornerId, ...variables }],
                };
                setSelectedShape(optimisticShape);
            }

            if (selectedCorner) {
                const optimisticCorner = {
                    cornerId: tempCornerId,
                    shapeId: variables.shapeId,
                    pointIndex: selectedCorner.pointIndex,
                    pointId: selectedCorner.pointId,
                    type: variables.type,
                    clip: variables.clip,
                    radius: variables.radius,
                    modificationLength: variables.modificationLength,
                    modificationDepth: variables.modificationDepth,
                };
                setSelectedCorner(optimisticCorner);
            }

            return { previousData, tempCornerId };
        },
        onError: (_err, _variables, context) => {
            // If the mutation fails, use the context returned from onMutate to roll back
            if (context?.previousData && designId) {
                utils.design.getById.setData({ id: designId }, context.previousData);
            }
        },
        onSuccess: (data, variables, context) => {
            // Update selected corner in context for optimistic UX
            if (context?.tempCornerId && designId) {
                const current = utils.design.getById.getData({ id: designId });
                if (!current) return;

                utils.design.getById.setData(
                    { id: designId },
                    {
                        ...current,
                        shapes: current.shapes.map((shape) => ({
                            ...shape,
                            corners: shape.corners.map((corner) =>
                                corner.id === context.tempCornerId
                                    ? { ...corner, id: data.id }
                                    : corner
                            ),
                        })),
                    }
                );
                if (selectedShape && selectedShape.id === variables.shapeId) {
                    const optimisticShape = {
                        ...selectedShape,
                        corners: selectedShape.corners.map((corner) => corner.id === context.tempCornerId ? { ...corner, id: data.id } : corner),
                    };
                    setSelectedShape(optimisticShape);
                }
                if (selectedCorner) {
                    const optimisticCorner = {
                        ...selectedCorner,
                        cornerId: data.id,
                        shapeId: variables.shapeId,
                        pointIndex: selectedCorner.pointIndex,
                        pointId: selectedCorner.pointId,
                        type: variables.type,
                        clip: variables.clip,
                        radius: variables.radius,
                        modificationLength: variables.modificationLength,
                        modificationDepth: variables.modificationDepth,
                    };
                    setSelectedCorner(optimisticCorner);
                }
            }
        },
    });
};

export default useCreateCornerModification;