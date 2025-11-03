import { useShape } from "~/context/ShapeContext";
import { api } from "~/utils/api";

export const useDeleteEdgeModification = (designId: string | undefined) => {
    const utils = api.useUtils();
    const { selectedShape, setSelectedShape, selectedEdge, setSelectedEdge } = useShape();

    return api.design.removeShapeEdgeModification.useMutation({
        onMutate: async (variables) => {
            if (!designId) return { previousData: undefined };

            // Cancel any outgoing refetches
            await utils.design.getById.cancel({ id: designId });

            // Snapshot the previous value
            const previousData = utils.design.getById.getData({ id: designId });

            if (previousData) {
                // Set edge modification type to None optimistically
                utils.design.getById.setData(
                    { id: designId },
                    {
                        ...previousData,
                        shapes: previousData.shapes.map((shape) => ({
                            ...shape,
                            edges: shape.edges.map((edge) => ({
                                ...edge,
                                edgeModifications: edge.edgeModifications.map((mod) => {
                                    if (mod.id === variables.edgeModificationId) {
                                        return {
                                            ...mod,
                                            type: "None" as const,
                                            position: "Center" as const,
                                            distance: 0,
                                            depth: 0,
                                            width: 0,
                                            sideAngleLeft: 0,
                                            sideAngleRight: 0,
                                            fullRadiusDepth: 0,
                                        };
                                    }
                                    return mod;
                                }),
                            })),
                        })),
                    },
                );
            }

            // Update selected shape and edge in context for optimistic UX
            if (selectedShape) {
                const updatedShape = {
                    ...selectedShape,
                    edges: selectedShape.edges.map((edge) => ({
                        ...edge,
                        edgeModifications: edge.edgeModifications.map((mod) => {
                            if (mod.id === variables.edgeModificationId) {
                                return {
                                    ...mod,
                                    type: "None" as const,
                                    position: "Center" as const,
                                    distance: 0,
                                    depth: 0,
                                    width: 0,
                                    sideAngleLeft: 0,
                                    sideAngleRight: 0,
                                    fullRadiusDepth: 0,
                                };
                            }
                            return mod;
                        }),
                    })),
                };
                setSelectedShape(updatedShape);

                // Update selected edge if the modified edge modification was the selected one
                if (selectedEdge && selectedEdge.edgeModification?.id === variables.edgeModificationId) {
                    const updatedEdge = updatedShape.edges.find(e => e.id === selectedEdge.edgeId);
                    const updatedMod = updatedEdge?.edgeModifications.find(m => m.id === variables.edgeModificationId);
                    if (updatedEdge && updatedMod) {
                        setSelectedEdge({
                            ...selectedEdge,
                            edgeModification: updatedMod,
                        });
                    }
                }
            }

            return { previousData };
        },
        onError: (_err, _variables, context) => {
            // If the mutation fails, use the context returned from onMutate to roll back
            if (context?.previousData && designId) {
                utils.design.getById.setData({ id: designId }, context.previousData);
            }
        },
        onSuccess: (data, variables) => {
            // For setting to None, we don't need to reconcile temp IDs since we're updating existing entities
            // The optimistic update already shows the correct data, and the server confirms it
            // No additional action needed - the cache already has the correct data
        },
    });
};