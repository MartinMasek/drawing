import { useShape } from "~/context/ShapeContext";
import { api } from "~/utils/api";

const useUpdateCornerModification = (designId: string | undefined) => {
    const utils = api.useUtils();
    const { selectedShape, setSelectedShape, selectedCorner, setSelectedCorner } = useShape();

    return api.design.updateCornerModification.useMutation({
        onMutate: async (variables) => {
            if (!designId) return { previousData: undefined };

            await utils.design.getById.cancel({ id: designId });

            const previousData = utils.design.getById.getData({ id: designId });
            if (previousData) {
                utils.design.getById.setData(
                    { id: designId },
                    {
                        ...previousData,
                        shapes: previousData.shapes.map((shape) => ({
                            ...shape,
                            corners: shape.corners.map((corner) =>
                                corner.id === variables.cornerId
                                    ? { ...corner, ...variables }
                                    : corner
                            ),
                        })),
                    }
                );
            }

            if (selectedShape && selectedShape.id === variables.cornerId) {
                const optimisticShape = {
                    ...selectedShape,
                    corners: selectedShape.corners.map((corner) => corner.id === variables.cornerId ? { ...corner, ...variables } : corner),
                };
                setSelectedShape(optimisticShape);
            }

            if (selectedCorner) {
                const optimisticCorner = {
                    cornerId: variables.cornerId,
                    shapeId: selectedShape?.id ?? "",
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

            return { previousData };
        },
        onError: (_err, _variables, context) => {
            // If the mutation fails, use the context returned from onMutate to roll back
            if (context?.previousData && designId) {
                utils.design.getById.setData({ id: designId }, context.previousData);
            }
        },
    });
};

export default useUpdateCornerModification;