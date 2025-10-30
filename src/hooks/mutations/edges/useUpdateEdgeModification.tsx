import { api } from "~/utils/api";
import { useShape } from "~/components/header/context/ShapeContext";
import { generateEdgePoints } from "~/components/shape/edgeUtils";
import type { Point } from "~/types/drawing";

export const useUpdateEdgeModification = (designId: string | undefined) => {
    const utils = api.useUtils();
    const { selectedShape, setSelectedShape, selectedEdge, setSelectedEdge } = useShape();

    return api.design.updateShapeEdge.useMutation({
        onMutate: async (variables) => {
            if (!designId) return { previousData: undefined };

            // Cancel any outgoing refetches
            await utils.design.getById.cancel({ id: designId });

            // Snapshot the previous value
            const previousData = utils.design.getById.getData({ id: designId });

            // Calculate points for the edge modification
            let calculatedPoints: Point[] = [];
            if (previousData) {
                // Find the edge to get point IDs
                const shape = previousData.shapes.find((s) => 
                    s.edges.some((e) => e.id === variables.edgeId)
                );
                
                if (shape) {
                    const edge = shape.edges.find((e) => e.id === variables.edgeId);
                    if (edge) {
                        const point1 = shape.points.find((p) => p.id === edge.point1Id);
                        const point2 = shape.points.find((p) => p.id === edge.point2Id);
                        
                        if (point1 && point2) {
                            const edgeModification = {
                                id: null,
                                type: variables.edgeModification.edgeType,
                                position: variables.edgeModification.position,
                                distance: variables.edgeModification.distance,
                                depth: variables.edgeModification.depth,
                                width: variables.edgeModification.width,
                                sideAngleLeft: variables.edgeModification.sideAngleLeft,
                                sideAngleRight: variables.edgeModification.sideAngleRight,
                                fullRadiusDepth: variables.edgeModification.fullRadiusDepth ?? 0,
                                points: [],
                            };
                            
                            const pointsWithoutIds = generateEdgePoints(
                                point1,
                                point2,
                                [edgeModification],
                            );
                            
                            calculatedPoints = pointsWithoutIds.map((coord) => ({
                                id: '',
                                xPos: coord.xPos,
                                yPos: coord.yPos,
                            }));
                        }
                    }
                }
            }

            if (previousData) {
                // Update existing edge modification optimistically
                utils.design.getById.setData(
                    { id: designId },
                    {
                        ...previousData,
                        shapes: previousData.shapes.map((shape) => {
                            if (shape.id !== variables.shapeId) return shape;

                            return {
                                ...shape,
                                edges: shape.edges.map((edge) => {
                                    if (edge.id === variables.edgeId) {
                                        return {
                                            ...edge,
                                            edgeModifications: edge.edgeModifications.map((mod) => {
                                                if (mod.id === variables.edgeModificationId) {
                                                    return {
                                                        ...mod,
                                                        type: variables.edgeModification.edgeType,
                                                        position: variables.edgeModification.position,
                                                        distance: variables.edgeModification.distance,
                                                        depth: variables.edgeModification.depth,
                                                        width: variables.edgeModification.width,
                                                        sideAngleLeft: variables.edgeModification.sideAngleLeft,
                                                        sideAngleRight: variables.edgeModification.sideAngleRight,
                                                        fullRadiusDepth: variables.edgeModification.fullRadiusDepth ?? 0,
                                                        points: calculatedPoints
                                                    };
                                                }
                                                return mod;
                                            }),
                                        };
                                    }
                                    return edge;
                                }),
                            };
                        }),
                    },
                );
            }

            // Update selected shape and edge in context for optimistic UX
            if (selectedShape && selectedShape.id === variables.shapeId) {
                const updatedShape = {
                    ...selectedShape,
                    edges: selectedShape.edges.map((edge) => {
                        if (edge.id === variables.edgeId) {
                            return {
                                ...edge,
                                edgeModifications: edge.edgeModifications.map((mod) => {
                                    if (mod.id === variables.edgeModificationId) {
                                        return {
                                            ...mod,
                                            type: variables.edgeModification.edgeType,
                                            position: variables.edgeModification.position,
                                            distance: variables.edgeModification.distance,
                                            depth: variables.edgeModification.depth,
                                            width: variables.edgeModification.width,
                                            sideAngleLeft: variables.edgeModification.sideAngleLeft,
                                            sideAngleRight: variables.edgeModification.sideAngleRight,
                                            fullRadiusDepth: variables.edgeModification.fullRadiusDepth ?? 0,
                                            points: calculatedPoints,
                                        };
                                    }
                                    return mod;
                                }),
                            };
                        }
                        return edge;
                    }),
                };
                setSelectedShape(updatedShape);

                // Update selected edge if it matches the one being updated
                if (selectedEdge && selectedEdge.edgeId === variables.edgeId) {
                    const optimisticEdge = {
                        ...selectedEdge,
                        edgeModification: {
                            id: variables.edgeModificationId,
                            type: variables.edgeModification.edgeType,
                            position: variables.edgeModification.position,
                            distance: variables.edgeModification.distance,
                            depth: variables.edgeModification.depth,
                            width: variables.edgeModification.width,
                            sideAngleLeft: variables.edgeModification.sideAngleLeft,
                            sideAngleRight: variables.edgeModification.sideAngleRight,
                            fullRadiusDepth: variables.edgeModification.fullRadiusDepth ?? 0,
                            points: calculatedPoints,
                        }
                    };

                    setSelectedEdge(optimisticEdge);
                }
            }

            // Inject calculated points into variables for the actual mutation
            variables.edgeModification.points = calculatedPoints;

            return { previousData };
        },
        onError: (_err, _variables, context) => {
            // If the mutation fails, use the context returned from onMutate to roll back
            if (context?.previousData && designId) {
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
