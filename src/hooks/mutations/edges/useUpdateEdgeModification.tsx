import { api } from "~/utils/api";
import { useShape } from "~/context/ShapeContext";
import { generateEdgePoints } from "~/components/shape/edgeUtils";
import type { Point } from "~/types/drawing";

export const useUpdateEdgeModification = (
    designId: string | undefined,
    options?: {
        onSuccess?: () => void;
    }
) => {
    const utils = api.useUtils();
    const { selectedShape, setSelectedShape, selectedEdge, setSelectedEdge } = useShape();
    const updateMutation = api.design.updateShapeEdge.useMutation();

    return api.design.updateShapeEdge.useMutation({
        onMutate: async (variables) => {
            if (!designId) return { previousData: undefined, tempModificationId: undefined };

            // Cancel any outgoing refetches to prevent race conditions
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

            // Generate temp ID for new modifications
            const tempModificationId = variables.edgeModificationId ?? `temp-mod-${Date.now()}`;

            if (previousData) {
                // Update existing edge modification or add new one optimistically
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
                                        // If adding new modification (edgeModificationId is null)
                                        if (variables.edgeModificationId === null) {
                                            return {
                                                ...edge,
                                                edgeModifications: [
                                                    ...edge.edgeModifications,
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
                                            };
                                        }

                                        // Otherwise, update existing modification
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
                            // If adding new modification (edgeModificationId is null)
                            if (variables.edgeModificationId === null) {
                                return {
                                    ...edge,
                                    edgeModifications: [
                                        ...edge.edgeModifications,
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
                                };
                            }

                            // Otherwise, update existing modification
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
                        }
                    };

                    setSelectedEdge(optimisticEdge);
                }
            }

            // Inject calculated points into variables for the actual mutation
            variables.edgeModification.points = calculatedPoints;

            return { previousData, tempModificationId };
        },
        onError: (_err, _variables, context) => {
            // If the mutation fails, use the context returned from onMutate to roll back
            if (context?.previousData && designId) {
                utils.design.getById.setData({ id: designId }, context.previousData);
            }
        },
        onSuccess: (data, variables, context) => {
            if (!designId) return;

            const current = utils.design.getById.getData({ id: designId });
            if (!current) return;

            // If we added a new modification (edgeModificationId was null), reconcile temp ID
            if (variables.edgeModificationId === null && context?.tempModificationId) {
                utils.design.getById.setData(
                    { id: designId },
                    {
                        ...current,
                        shapes: current.shapes.map((shape) => {
                            if (shape.id !== variables.shapeId) return shape;
                            return {
                                ...shape,
                                edges: shape.edges.map((edge) => {
                                    if (edge.id !== variables.edgeId) return edge;
                                    return {
                                        ...edge,
                                        edgeModifications: edge.edgeModifications.map((mod) => {
                                            if (mod.id === context.tempModificationId) {
                                                return {
                                                    ...mod,
                                                    id: data.id,
                                                    points: data.points ?? mod.points,
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

                // Update selectedEdge with real ID
                // Check both the temp ID and null (in case state hasn't updated yet)
                if (selectedEdge && selectedEdge.edgeId === variables.edgeId) {
                    const matchesTempId = selectedEdge.edgeModification?.id === context.tempModificationId;
                    const isNullId = selectedEdge.edgeModification?.id === null;

                    if (matchesTempId || isNullId) {
                        // Check if user made changes while creation was in progress
                        const serverMod = {
                            depth: data.depth ?? variables.edgeModification.depth,
                            width: data.width ?? variables.edgeModification.width,
                            distance: data.distance ?? variables.edgeModification.distance,
                            position: data.position ?? variables.edgeModification.position,
                            sideAngleLeft: data.sideAngleLeft ?? variables.edgeModification.sideAngleLeft,
                            sideAngleRight: data.sideAngleRight ?? variables.edgeModification.sideAngleRight,
                            fullRadiusDepth: data.fullRadiusDepth ?? variables.edgeModification.fullRadiusDepth,
                        };

                        const hasUserChanges = selectedEdge.edgeModification && (
                            selectedEdge.edgeModification.depth !== serverMod.depth ||
                            selectedEdge.edgeModification.width !== serverMod.width ||
                            selectedEdge.edgeModification.distance !== serverMod.distance ||
                            selectedEdge.edgeModification.position !== serverMod.position ||
                            selectedEdge.edgeModification.sideAngleLeft !== serverMod.sideAngleLeft ||
                            selectedEdge.edgeModification.sideAngleRight !== serverMod.sideAngleRight ||
                            selectedEdge.edgeModification.fullRadiusDepth !== serverMod.fullRadiusDepth
                        );

                        setSelectedEdge({
                            ...selectedEdge,
                            edgeModification: {
                                id: data.id,
                                type: data.edgeType,
                                position: data.position ?? selectedEdge.edgeModification?.position ?? variables.edgeModification.position,
                                distance: data.distance ?? selectedEdge.edgeModification?.distance ?? variables.edgeModification.distance,
                                depth: data.depth ?? selectedEdge.edgeModification?.depth ?? variables.edgeModification.depth,
                                width: data.width ?? selectedEdge.edgeModification?.width ?? variables.edgeModification.width,
                                sideAngleLeft: data.sideAngleLeft ?? selectedEdge.edgeModification?.sideAngleLeft ?? variables.edgeModification.sideAngleLeft,
                                sideAngleRight: data.sideAngleRight ?? selectedEdge.edgeModification?.sideAngleRight ?? variables.edgeModification.sideAngleRight,
                                fullRadiusDepth: data.fullRadiusDepth ?? selectedEdge.edgeModification?.fullRadiusDepth ?? variables.edgeModification.fullRadiusDepth ?? 0,
                                points: data.points ?? selectedEdge.edgeModification?.points ?? [],
                            },
                        });

                        // If user made changes while creation was in progress, sync them to server
                        if (hasUserChanges && selectedEdge.edgeModification && selectedShape) {
                            const point1 = selectedShape.points.find((p) => p.id === selectedEdge.edgePoint1Id);
                            const point2 = selectedShape.points.find((p) => p.id === selectedEdge.edgePoint2Id);

                            if (point1 && point2) {
                                const pointsCoords = generateEdgePoints(
                                    point1,
                                    point2,
                                    [selectedEdge.edgeModification],
                                );

                                updateMutation.mutate({
                                    edgeId: variables.edgeId,
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

                // Update selectedShape with real ID
                if (selectedShape) {
                    const updatedShape = {
                        ...selectedShape,
                        edges: selectedShape.edges.map((edge) => {
                            if (edge.id !== variables.edgeId) return edge;
                            return {
                                ...edge,
                                edgeModifications: edge.edgeModifications.map((mod) => {
                                    if (mod.id === context.tempModificationId) {
                                        return {
                                            ...mod,
                                            id: data.id,
                                            points: data.points ?? mod.points,
                                        };
                                    }
                                    return mod;
                                }),
                            };
                        }),
                    };
                    setSelectedShape(updatedShape);
                }
            } else if (variables.edgeModificationId) {
                // For updates of existing modifications, sync with server response
                utils.design.getById.setData(
                    { id: designId },
                    {
                        ...current,
                        shapes: current.shapes.map((shape) => {
                            if (shape.id !== variables.shapeId) return shape;
                            return {
                                ...shape,
                                edges: shape.edges.map((edge) => {
                                    if (edge.id !== variables.edgeId) return edge;
                                    return {
                                        ...edge,
                                        edgeModifications: edge.edgeModifications.map((mod) => {
                                            if (mod.id === variables.edgeModificationId) {
                                                return {
                                                    ...mod,
                                                    // Sync all properties with server response
                                                    type: data.edgeType,
                                                    position: data.position ?? mod.position,
                                                    distance: data.distance ?? mod.distance,
                                                    depth: data.depth ?? mod.depth,
                                                    width: data.width ?? mod.width,
                                                    sideAngleLeft: data.sideAngleLeft ?? mod.sideAngleLeft,
                                                    sideAngleRight: data.sideAngleRight ?? mod.sideAngleRight,
                                                    fullRadiusDepth: data.fullRadiusDepth ?? mod.fullRadiusDepth,
                                                    points: data.points ?? mod.points,
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

                // Update selectedEdge with server data
                if (selectedEdge && selectedEdge.edgeModification?.id === variables.edgeModificationId) {
                    setSelectedEdge({
                        ...selectedEdge,
                        edgeModification: {
                            id: data.id,
                            type: data.edgeType,
                            position: data.position ?? selectedEdge.edgeModification.position,
                            distance: data.distance ?? selectedEdge.edgeModification.distance,
                            depth: data.depth ?? selectedEdge.edgeModification.depth,
                            width: data.width ?? selectedEdge.edgeModification.width,
                            sideAngleLeft: data.sideAngleLeft ?? selectedEdge.edgeModification.sideAngleLeft,
                            sideAngleRight: data.sideAngleRight ?? selectedEdge.edgeModification.sideAngleRight,
                            fullRadiusDepth: data.fullRadiusDepth ?? selectedEdge.edgeModification.fullRadiusDepth,
                            points: data.points ?? selectedEdge.edgeModification.points,
                        },
                    });
                }

                // Update selectedShape with server data
                if (selectedShape) {
                    const updatedShape = {
                        ...selectedShape,
                        edges: selectedShape.edges.map((edge) => {
                            if (edge.id !== variables.edgeId) return edge;
                            return {
                                ...edge,
                                edgeModifications: edge.edgeModifications.map((mod) => {
                                    if (mod.id === variables.edgeModificationId) {
                                        return {
                                            ...mod,
                                            type: data.edgeType,
                                            position: data.position ?? mod.position,
                                            distance: data.distance ?? mod.distance,
                                            depth: data.depth ?? mod.depth,
                                            width: data.width ?? mod.width,
                                            sideAngleLeft: data.sideAngleLeft ?? mod.sideAngleLeft,
                                            sideAngleRight: data.sideAngleRight ?? mod.sideAngleRight,
                                            fullRadiusDepth: data.fullRadiusDepth ?? mod.fullRadiusDepth,
                                            points: data.points ?? mod.points,
                                        };
                                    }
                                    return mod;
                                }),
                            };
                        }),
                    };
                    setSelectedShape(updatedShape);
                }
            }
            
            // Call the custom onSuccess callback after state is updated
            if (options?.onSuccess) {
                options.onSuccess();
            }
        },
    });
};
