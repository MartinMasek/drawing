import { api } from "~/utils/api";
import { useShape } from "~/components/header/context/ShapeContext";

export const useCreateEdgeModification = (designId: string | undefined) => {
    const utils = api.useUtils();
    const { selectedShape, setSelectedShape, selectedEdge, setSelectedEdge } = useShape();

    return api.design.createShapeEdge.useMutation({
        onMutate: async (variables) => {
            if (!designId) return { previousData: undefined, tempEdgeId: undefined, tempModificationId: undefined };

            // Cancel any outgoing refetches
            await utils.design.getById.cancel({ id: designId });

            // Snapshot the previous value
            const previousData = utils.design.getById.getData({ id: designId });

            // Create temporary IDs for optimistic update
            const tempEdgeId = `temp-edge-${Date.now()}`;
            const tempModificationId = `temp-mod-${Date.now()}`;

            if (previousData) {
                utils.design.getById.setData(
                    { id: designId },
                    {
                        ...previousData,
                        shapes: previousData.shapes.map((shape) => {
                            if (shape.id !== variables.shapeId) return shape;

                            return {
                                ...shape,
                                edges: [
                                    ...shape.edges,
                                    {
                                        id: tempEdgeId,
                                        point1Id: variables.edgePoint1Id,
                                        point2Id: variables.edgePoint2Id,
                                        edgeModifications: [
                                            {
                                                id: tempModificationId,
                                                type: variables.edgeModification.edgeType,
                                                position: variables.edgeModification.position,
                                                distance: variables.edgeModification.distance,
                                                depth: variables.edgeModification.depth,
                                                width: variables.edgeModification.width,
                                                sideAngleLeft: variables.edgeModification.sideAngleLeft,
                                                sideAngleRight: variables.edgeModification.sideAngleRight,
                                                fullRadiusDepth: variables.edgeModification.fullRadiusDepth ?? 0,
                                            },
                                        ],
                                    },
                                ],
                            };
                        }),
                    },
                );
            }

            // Update selected shape and edge in context for optimistic UX
            if (selectedShape && selectedShape.id === variables.shapeId) {
                const optimisticShape = {
                    ...selectedShape,
                    edges: [
                        ...selectedShape.edges,
                        {
                            id: tempEdgeId,
                            point1Id: variables.edgePoint1Id,
                            point2Id: variables.edgePoint2Id,
                            edgeModifications: [
                                {
                                    id: tempModificationId,
                                    type: variables.edgeModification.edgeType,
                                    position: variables.edgeModification.position,
                                    distance: variables.edgeModification.distance,
                                    depth: variables.edgeModification.depth,
                                    width: variables.edgeModification.width,
                                    sideAngleLeft: variables.edgeModification.sideAngleLeft,
                                    sideAngleRight: variables.edgeModification.sideAngleRight,
                                    fullRadiusDepth: variables.edgeModification.fullRadiusDepth ?? 0,
                                },
                            ],
                        },
                    ],
                };
                setSelectedShape(optimisticShape);

                // Update selected edge
                if (selectedEdge) {
                    setSelectedEdge({
                        shapeId: variables.shapeId,
                        edgeIndex: selectedEdge?.edgeIndex ?? 0,
                        edgeId: tempEdgeId,
                        edgePoint1Id: variables.edgePoint1Id,
                        edgePoint2Id: variables.edgePoint2Id,
                        edgeModification: {
                            id: tempModificationId,
                            type: variables.edgeModification.edgeType,
                            position: variables.edgeModification.position,
                            distance: variables.edgeModification.distance,
                            depth: variables.edgeModification.depth,
                            width: variables.edgeModification.width,
                            sideAngleLeft: variables.edgeModification.sideAngleLeft,
                            sideAngleRight: variables.edgeModification.sideAngleRight,
                            fullRadiusDepth: variables.edgeModification.fullRadiusDepth ?? 0,
                        },
                    });
                }
            }

            return { previousData, tempEdgeId, tempModificationId, edgeIndex: selectedEdge?.edgeIndex ?? 0 };
        },
        onError: (_err, _variables, context) => {
            // If the mutation fails, use the context returned from onMutate to roll back
            if (context?.previousData && designId) {
                utils.design.getById.setData({ id: designId }, context.previousData);
            }
        },
        onSuccess: (data, variables, context) => {
            // Reconcile temp entities with server-returned ids
            if (context?.tempEdgeId && designId) {
                const current = utils.design.getById.getData({ id: designId });
                if (!current) return;

                // The data returned is an EdgeModification with edgeId field
                utils.design.getById.setData(
                    { id: designId },
                    {
                        ...current,
                        shapes: current.shapes.map((shape) => {
                            if (shape.id !== variables.shapeId) return shape;
                            return {
                                ...shape,
                                edges: shape.edges.map((edge) => {
                                    if (edge.id !== context.tempEdgeId) return edge;
                                    return {
                                        ...edge,
                                        id: data.edgeId, // Use the edgeId from the returned data
                                        edgeModifications: edge.edgeModifications.map((mod) => {
                                            if (mod.id === context.tempModificationId) {
                                                return {
                                                    ...mod,
                                                    id: data.id, // Use the real modification ID
                                                    type: data.edgeType,
                                                    position: data.position ?? "Center",
                                                    distance: data.distance ?? 0,
                                                    depth: data.depth ?? 0,
                                                    width: data.width ?? 0,
                                                    sideAngleLeft: data.sideAngleLeft ?? 0,
                                                    sideAngleRight: data.sideAngleRight ?? 0,
                                                    fullRadiusDepth: data.fullRadiusDepth ?? 0,
                                                };
                                            }
                                            return mod;
                                        }),
                                    };
                                }),
                            };
                        }),
                    },
                );

                // Update selected shape and edge with real IDs
                if (selectedShape && selectedShape.id === variables.shapeId) {
                    const realEdge = {
                        id: data.edgeId,
                        point1Id: variables.edgePoint1Id,
                        point2Id: variables.edgePoint2Id,
                        edgeModifications: [
                            {
                                id: data.id,
                                type: data.edgeType,
                                position: data.position ?? "Center",
                                distance: data.distance ?? 0,
                                depth: data.depth ?? 0,
                                width: data.width ?? 0,
                                sideAngleLeft: data.sideAngleLeft ?? 0,
                                sideAngleRight: data.sideAngleRight ?? 0,
                                fullRadiusDepth: data.fullRadiusDepth ?? 0,
                            },
                        ],
                    };
                    const updatedShape = {
                        ...selectedShape,
                        edges: selectedShape.edges.map((e) => (e.id === context.tempEdgeId ? realEdge : e)),
                    };
                    setSelectedShape(updatedShape);

                    if (selectedEdge && selectedEdge.edgeIndex === context.edgeIndex) {
                        const realMod = realEdge.edgeModifications[0];

                        if (realMod) {
                            setSelectedEdge({
                                shapeId: variables.shapeId,
                                edgeIndex: selectedEdge?.edgeIndex ?? 0,
                                edgeId: data.edgeId,
                                edgePoint1Id: variables.edgePoint1Id,
                                edgePoint2Id: variables.edgePoint2Id,
                                edgeModification: realMod,
                            });
                        }
                    }
                }
            }
        },
    });
};
