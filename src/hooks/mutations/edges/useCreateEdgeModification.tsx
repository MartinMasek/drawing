import { api } from "~/utils/api";
import { useShape } from "~/context/ShapeContext";
import { generateEdgePoints } from "~/components/shape/edgeUtils";
import type { Point } from "~/types/drawing";

export const useCreateEdgeModification = (
    designId: string | undefined,
    options?: {
        onSuccess?: () => void;
    }
) => {
    const utils = api.useUtils();
    const { selectedShape, setSelectedShape, selectedEdge, setSelectedEdge } = useShape();
    const updateMutation = api.design.updateShapeEdge.useMutation();

    return api.design.createShapeEdge.useMutation({
        onMutate: async (variables) => {
            if (!designId) return { previousData: undefined, tempEdgeId: undefined, tempModificationId: undefined };

            // Cancel any outgoing refetches
            await utils.design.getById.cancel({ id: designId });

            // Snapshot the previous value
            const previousData = utils.design.getById.getData({ id: designId });

            // Calculate points for the edge modification
            let calculatedPoints: Point[] = [];
            if (previousData) {
                const shape = previousData.shapes.find((s) => s.id === variables.shapeId);
                if (shape) {
                    const point1 = shape.points.find((p) => p.id === variables.edgePoint1Id);
                    const point2 = shape.points.find((p) => p.id === variables.edgePoint2Id);

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

                        // Convert Coordinate[] to Point[] (without IDs since they'll be created by backend)
                        calculatedPoints = pointsWithoutIds.map((coord) => ({
                            id: '', // Empty ID, will be set by backend
                            xPos: coord.xPos,
                            yPos: coord.yPos,
                        }));
                    }
                }
            }

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
                                                points: calculatedPoints,
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
                                    points: calculatedPoints,
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
                        edgeIndex: selectedEdge.edgeIndex,
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
                            points: calculatedPoints,
                        },
                    });
                }
            }

            // Inject calculated points into variables for the actual mutation
            variables.edgeModification.points = calculatedPoints;

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
                                                    points: data.points ?? mod.points, // Use server points with real IDs
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
                    const updatedShape = {
                        ...selectedShape,
                        edges: selectedShape.edges.map((edge) => {
                            if (edge.id !== context.tempEdgeId) return edge;

                            // Replace temp IDs with real IDs, keep all data
                            return {
                                ...edge,
                                id: data.edgeId,
                                edgeModifications: edge.edgeModifications.map((mod) => {
                                    if (mod.id === context.tempModificationId) {
                                        return {
                                            ...mod,
                                            id: data.id,
                                        };
                                    }
                                    return mod;
                                }),
                            };
                        }),
                    };
                    setSelectedShape(updatedShape);

                    // Update selectedEdge with real IDs
                    // Check if selectedEdge is for this edge (by index or by point IDs)
                    const isMatchingEdge = selectedEdge && (
                        selectedEdge.edgeIndex === context.edgeIndex ||
                        (selectedEdge.edgePoint1Id === variables.edgePoint1Id &&
                            selectedEdge.edgePoint2Id === variables.edgePoint2Id)
                    );

                    if (isMatchingEdge) {
                        const updatedEdge = updatedShape.edges.find(e => e.id === data.edgeId);
                        const realMod = updatedEdge?.edgeModifications.find(m => m.id === data.id);

                        if (realMod) {
                            // Check if user made changes while creation was in progress
                            const hasUserChanges = selectedEdge.edgeModification && (
                                selectedEdge.edgeModification.depth !== realMod.depth ||
                                selectedEdge.edgeModification.width !== realMod.width ||
                                selectedEdge.edgeModification.distance !== realMod.distance ||
                                selectedEdge.edgeModification.position !== realMod.position ||
                                selectedEdge.edgeModification.sideAngleLeft !== realMod.sideAngleLeft ||
                                selectedEdge.edgeModification.sideAngleRight !== realMod.sideAngleRight ||
                                selectedEdge.edgeModification.fullRadiusDepth !== realMod.fullRadiusDepth
                            );

                            setSelectedEdge({
                                edgeId: data.edgeId,
                                shapeId: variables.shapeId,
                                edgeIndex: context.edgeIndex,
                                edgePoint1Id: variables.edgePoint1Id,
                                edgePoint2Id: variables.edgePoint2Id,
                                edgeModification: realMod,
                            });

                            // If user made changes while creation was in progress, sync them to server
                            if (hasUserChanges && selectedEdge.edgeModification && selectedShape) {
                                const point1 = selectedShape.points.find((p) => p.id === variables.edgePoint1Id);
                                const point2 = selectedShape.points.find((p) => p.id === variables.edgePoint2Id);

                                if (point1 && point2) {
                                    const pointsCoords = generateEdgePoints(
                                        point1,
                                        point2,
                                        [selectedEdge.edgeModification],
                                    );

                                    updateMutation.mutate({
                                        edgeId: data.edgeId,
                                        shapeId: variables.shapeId,
                                        edgeModificationId: data.id,
                                        edgeModification: {
                                            edgeType: selectedEdge.edgeModification.type,
                                            position: selectedEdge.edgeModification.position,
                                            distance: selectedEdge.edgeModification.distance,
                                            depth: selectedEdge.edgeModification.depth,
                                            width: selectedEdge.edgeModification.width,
                                            sideAngleLeft: selectedEdge.edgeModification.sideAngleLeft,
                                            sideAngleRight: selectedEdge.edgeModification.sideAngleRight,
                                            fullRadiusDepth: selectedEdge.edgeModification.fullRadiusDepth,
                                            points: pointsCoords.map((coord) => ({
                                                xPos: coord.xPos,
                                                yPos: coord.yPos,
                                            })),
                                        },
                                    });
                                }
                            }
                        }
                    }
                }
            }
            
            // Call the custom onSuccess callback after state is updated
            if (options?.onSuccess) {
                options.onSuccess();
            }
        },
    });
};
