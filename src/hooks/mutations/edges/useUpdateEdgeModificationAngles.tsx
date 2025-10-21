import { useShape } from "~/components/header/context/ShapeContext";
import { api } from "~/utils/api";

export const useUpdateEdgeModificationAngles = (designId: string | undefined) => {
    const utils = api.useUtils();
    const { selectedShape, setSelectedShape, selectedEdge, setSelectedEdge } = useShape();
    return api.design.edgeModificationUpdateAngles.useMutation({
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
                            edges: shape.edges.map((edge) => ({
                                ...edge,
                                edgeModifications: edge.edgeModifications.map((mod) =>
                                    mod.id === variables.edgeModificationId
                                        ? { ...mod, sideAngleLeft: variables.sideAngleLeft, sideAngleRight: variables.sideAngleRight }
                                        : mod
                                ),
                            })),
                        })),
                    }
                );
            }

            if (selectedEdge) {
                setSelectedEdge({
                    ...selectedEdge,
                    edgeModification: selectedEdge.edgeModification ? {
                        ...selectedEdge.edgeModification,
                        sideAngleLeft: variables.sideAngleLeft,
                        sideAngleRight: variables.sideAngleRight,
                    } : undefined,
                })
            }
            if (selectedShape) {
                const updatedShape = {
                    ...selectedShape,
                    edges: selectedShape.edges.map((edge) => ({
                        ...edge,
                        edgeModifications: edge.edgeModifications.map((mod) =>
                            mod.id === variables.edgeModificationId
                                ? { ...mod, sideAngleLeft: variables.sideAngleLeft, sideAngleRight: variables.sideAngleRight }
                                : mod
                        )
                    })),
                };
                setSelectedShape(updatedShape);
            }
            return { previousData };
        },
        onError: (_err, _variables, context) => {
            if (designId && context?.previousData) {
                utils.design.getById.setData({ id: designId }, context.previousData);
            }
        },
        onSuccess: (data, variables) => {
            // For updates, we don't need to reconcile temp IDs since we're updating existing entities
            // The optimistic update already shows the correct data, and the server confirms it
            // No additional action needed - the cache already has the correct data
        },
    });
};