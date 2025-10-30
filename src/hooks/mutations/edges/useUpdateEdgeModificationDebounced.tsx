import { useCallback } from "react";
import { useShape } from "~/components/header/context/ShapeContext";
import { api } from "~/utils/api";
import { useDebouncedCallback } from "use-debounce";
import { DEBOUNCE_DELAY } from "~/utils/canvas-constants";
import { generateEdgePoints } from "~/components/shape/edgeUtils";
import type { EdgeModification } from "~/types/drawing";
import type { EdgeModificationType, EdgeShapePosition } from "@prisma/client";

type UpdatePayload = Partial<{
    edgeType: EdgeModificationType;
    position: EdgeShapePosition;
    distance: number;
    depth: number;
    width: number;
    sideAngleLeft: number;
    sideAngleRight: number;
    fullRadiusDepth: number;
}>;

export const useUpdateEdgeModificationDebounced = (designId: string | undefined) => {
    const utils = api.useUtils();
    const { selectedShape, setSelectedShape, selectedEdge, setSelectedEdge } = useShape();

    // Function to perform optimistic update immediately
    const performOptimisticUpdate = useCallback((
        edgeModificationId: string,
        updates: UpdatePayload
    ) => {
        if (!designId) return;

        // Update cache immediately with recalculated points
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
                            edgeModifications: edge.edgeModifications.map((mod) => {
                                if (mod.id === edgeModificationId) {
                                    const updatedMod = { ...mod, ...updates };
                                    
                                    // Recalculate points with the new values
                                    const point1 = shape.points.find((p) => p.id === edge.point1Id);
                                    const point2 = shape.points.find((p) => p.id === edge.point2Id);
                                    
                                    if (point1 && point2) {
                                        const calculatedCoords = generateEdgePoints(
                                            point1,
                                            point2,
                                            [updatedMod],
                                        );
                                        
                                        // Map coordinates to points, preserving existing IDs where possible
                                        const calculatedPoints = calculatedCoords.map((coord, index) => {
                                            const existingPoint = mod.points[index];
                                            return {
                                                id: existingPoint?.id || `temp-${Date.now()}-${index}`,
                                                xPos: coord.xPos,
                                                yPos: coord.yPos,
                                            };
                                        });
                                        
                                        return {
                                            ...updatedMod,
                                            points: calculatedPoints,
                                        };
                                    }
                                    
                                    return updatedMod;
                                }
                                return mod;
                            }),
                        })),
                    })),
                }
            );
        }

        // Update selected edge immediately
        if (selectedEdge?.edgeModification) {
            setSelectedEdge({
                ...selectedEdge,
                edgeModification: {
                    ...selectedEdge.edgeModification,
                    ...updates,
                },
            });
        }

        // Update selected shape immediately with recalculated points
        if (selectedShape) {
            const updatedShape = {
                ...selectedShape,
                edges: selectedShape.edges.map((edge) => ({
                    ...edge,
                    edgeModifications: edge.edgeModifications.map((mod) => {
                        if (mod.id === edgeModificationId) {
                            const updatedMod = { ...mod, ...updates };
                            
                            // Recalculate points with the new values
                            const point1 = selectedShape.points.find((p) => p.id === edge.point1Id);
                            const point2 = selectedShape.points.find((p) => p.id === edge.point2Id);
                            
                            if (point1 && point2) {
                                const calculatedCoords = generateEdgePoints(
                                    point1,
                                    point2,
                                    [updatedMod],
                                );
                                
                                // Map coordinates to points, preserving existing IDs where possible
                                const calculatedPoints = calculatedCoords.map((coord, index) => {
                                    const existingPoint = mod.points[index];
                                    return {
                                        id: existingPoint?.id || `temp-${Date.now()}-${index}`,
                                        xPos: coord.xPos,
                                        yPos: coord.yPos,
                                    };
                                });
                                
                                return {
                                    ...updatedMod,
                                    points: calculatedPoints,
                                };
                            }
                            
                            return updatedMod;
                        }
                        return mod;
                    })
                })),
            };
            setSelectedShape(updatedShape);
        }
    }, [designId, utils, selectedEdge, setSelectedEdge, selectedShape, setSelectedShape]);

    const updateShapeEdge = api.design.updateShapeEdge.useMutation();

    // Debounced function for the actual mutation
    const debouncedMutation = useDebouncedCallback(
        (
            edgeModificationId: string,
            edgeId: string,
            shapeId: string,
            fullModification: EdgeModification
        ) => {
            // Calculate points before sending to backend
            if (!designId) return;
            const previousData = utils.design.getById.getData({ id: designId });
            let calculatedPoints: { xPos: number; yPos: number }[] = [];

            if (previousData) {
                const shape = previousData.shapes.find((s) => s.id === shapeId);
                if (shape) {
                    const edge = shape.edges.find((e) => e.id === edgeId);
                    if (edge) {
                        const point1 = shape.points.find((p) => p.id === edge.point1Id);
                        const point2 = shape.points.find((p) => p.id === edge.point2Id);

                        if (point1 && point2) {
                            const pointsWithoutIds = generateEdgePoints(
                                point1,
                                point2,
                                [fullModification],
                            );

                            calculatedPoints = pointsWithoutIds.map((coord) => ({
                                xPos: coord.xPos,
                                yPos: coord.yPos,
                            }));
                        }
                    }
                }
            }

            updateShapeEdge.mutate({
                edgeId,
                shapeId,
                edgeModificationId,
                edgeModification: {
                    edgeType: fullModification.type,
                    position: fullModification.position,
                    distance: fullModification.distance,
                    depth: fullModification.depth,
                    width: fullModification.width,
                    sideAngleLeft: fullModification.sideAngleLeft,
                    sideAngleRight: fullModification.sideAngleRight,
                    fullRadiusDepth: fullModification.fullRadiusDepth,
                    points: calculatedPoints,
                },
            });
        },
        DEBOUNCE_DELAY
    );

    const updateModification = useCallback((
        edgeModificationId: string,
        updates: UpdatePayload
    ) => {
        // Perform optimistic update immediately
        performOptimisticUpdate(edgeModificationId, updates);

        // Get current modification data to send complete object to backend
        if (selectedEdge?.edgeModification && selectedEdge.edgeId) {
            const updatedMod: EdgeModification = {
                ...selectedEdge.edgeModification,
                ...updates,
            };

            // Trigger debounced mutation with full modification data
            debouncedMutation(
                edgeModificationId,
                selectedEdge.edgeId,
                selectedEdge.shapeId,
                updatedMod
            );
        }
    }, [performOptimisticUpdate, debouncedMutation, selectedEdge]);

    return {
        updateModification,
        // Convenience methods for specific updates
        updateSize: useCallback((id: string, depth: number, width: number) => 
            updateModification(id, { depth, width }), [updateModification]),
        updateAngles: useCallback((id: string, left: number, right: number) => 
            updateModification(id, { sideAngleLeft: left, sideAngleRight: right }), [updateModification]),
        updatePosition: useCallback((id: string, position: EdgeShapePosition) => 
            updateModification(id, { position }), [updateModification]),
        updateDistance: useCallback((id: string, distance: number) => 
            updateModification(id, { distance }), [updateModification]),
        updateFullRadiusDepth: useCallback((id: string, fullRadiusDepth: number) => 
            updateModification(id, { fullRadiusDepth }), [updateModification]),
        isLoading: updateShapeEdge.isPending,
        error: updateShapeEdge.error,
    };
};

