import { CornerType } from "@prisma/client";
import { useShape } from "~/components/context/ShapeContext";
import { api } from "~/utils/api";

const useDeleteCornerModification = (designId: string | undefined) => {
    const utils = api.useUtils();
    const { selectedShape, setSelectedShape, selectedCorner, setSelectedCorner } = useShape();

    return api.design.deleteCornerModification.useMutation({
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
                                corner.id === variables.cornerId ?
                                    {
                                        ...corner,
                                        type: CornerType.None,
                                        clip: undefined,
                                        radius: undefined,
                                        modificationLength: undefined,
                                        modificationDepth: undefined
                                    }
                                    :
                                    corner
                            )
                        }))
                    },
                );
            }
            if (selectedShape) {
                const optimisticShape = {
                    ...selectedShape,
                    corners: selectedShape.corners.map((corner) =>
                        corner.id === variables.cornerId ?
                            {
                                ...corner,
                                type: CornerType.None,
                                clip: undefined,
                                radius: undefined,
                                modificationLength: undefined,
                                modificationDepth: undefined
                            } : corner),
                };
                setSelectedShape(optimisticShape);
            }
            if (selectedCorner) {
                const optimisticCorner = {
                    ...selectedCorner,
                    type: CornerType.None,
                    clip: undefined,
                    radius: undefined,
                    modificationLength: undefined,
                    modificationDepth: undefined
                };
                setSelectedCorner(optimisticCorner);
            }
            return { previousData };
        },
        onError: (_err, _variables, context) => {
            if (context?.previousData && designId) {
                utils.design.getById.setData({ id: designId }, context.previousData);
            }
        },
    });
};

export default useDeleteCornerModification;