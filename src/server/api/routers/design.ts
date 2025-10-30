import {
	CornerType,
	EdgeModificationType,
	EdgeShapePosition,
} from "@prisma/client";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { textCreateSchema, textUpdateSchema } from "~/server/types/text-types";
import type { CanvasShape, CanvasText, EdgeModification } from "~/types/drawing";
import { getShapeEdgePointIndices } from "~/utils/shape-utils";
import type { PrismaClient } from "@prisma/client";
import { generateEdgePoints } from "~/components/shape/edgeUtils";

/**
 * Regenerate and save all points for an edge with modifications
 */
async function regenerateEdgePoints(
	db: PrismaClient,
	edgeId: string,
): Promise<void> {
	// Get the edge with its modifications and points
	const edge = await db.edge.findUnique({
		where: { id: edgeId },
		include: {
			point1: true,
			point2: true,
			edgeModifications: {
				include: {
					points: true,
				},
			},
			shape: { select: { id: true } },
		},
	});

	if (!edge) return;

	// If no modifications, clear all intermediate points
	if (edge.edgeModifications.length === 0) {
		await db.point.deleteMany({
			where: {
				edgeModificationsPoints: {
					some: { id: { in: edge.edgeModifications.map((mod) => mod.id) } },
				},
			},
		});
		return;
	}

	// Generate new points using shared utility
	const modifications: EdgeModification[] = edge.edgeModifications.map((mod) => ({
		id: mod.id,
		type: mod.edgeType,
		position: mod.position ?? EdgeShapePosition.Center,
		distance: mod.distance ?? 0,
		depth: mod.depth ?? 0,
		width: mod.width ?? 0,
		sideAngleLeft: mod.sideAngleLeft ?? 0,
		sideAngleRight: mod.sideAngleRight ?? 0,
		fullRadiusDepth: mod.fullRadiusDepth ?? 0,
		points: mod.points ?? [],
	}));

	const newPoints = generateEdgePoints(
		edge.point1,
		edge.point2,
		modifications,
	);

	// Delete old intermediate points
	await db.point.deleteMany({
		where: {
			edgeModificationsPoints: {
				some: { id: { in: edge.edgeModifications.map((mod) => mod.id) } },
			},
		},
	});

	// Create new points and link to edge
	if (newPoints.length > 0) {
		await db.point.createMany({
			data: newPoints.map((point) => ({
				xPos: point.xPos,
				yPos: point.yPos,
				edgeModificationsPoints: {
					connect: { id: { in: edge.edgeModifications.map((mod) => mod.id) } },
				},
			})),
		});
	}
}

export const designRouter = createTRPCRouter({
	// Get all designs
	getAll: publicProcedure.query(async ({ ctx }) => {
		return ctx.db.design.findMany({
			select: {
				id: true,
				name: true,
			},
			orderBy: {
				name: "asc",
			},
		});
	}),

	// Get design by ID (minimal fields mapped to show demo version working)
	getById: publicProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const result = await ctx.db.design.findUnique({
				where: { id: input.id },
				select: {
					id: true,
					name: true,
					shapes: {
						select: {
							id: true,
							xPos: true,
							yPos: true,
							rotation: true,
							points: { select: { id: true, xPos: true, yPos: true } },
							material: {
								select: {
									id: true,
									name: true,
									img: true,
									SKU: true,
									category: true,
									subcategory: true,
								},
							},
							edges: {
								select: {
									id: true,
									point1Id: true,
									point2Id: true,
									edgeModifications: {
										select: {
											id: true,
											edgeType: true,
											position: true,
											distance: true,
											depth: true,
											width: true,
											sideAngleLeft: true,
											sideAngleRight: true,
											fullRadiusDepth: true,
											points: true,
										},
									},
								},
							},
							corners: {
								select: {
									id: true,
									pointId: true,
									type: true,
									clip: true,
									radius: true,
									modificationLength: true,
									modificationDepth: true,
								},
							},
						},
					},
					texts: {
						select: {
							id: true,
							xPos: true,
							yPos: true,
							text: true,
							fontSize: true,
							isBold: true,
							isItalic: true,
							textColor: true,
							backgroundColor: true,
						},
					},
				},
			});

			if (!result) return null;

			const shapes: CanvasShape[] = result.shapes.map((s) => ({
				id: s.id,
				xPos: s.xPos,
				yPos: s.yPos,
				rotation: s.rotation,
				points: s.points,
				material: s.material ?? undefined,
				// Pre-calculate edge indices for frontend visualization
				edgeIndices: getShapeEdgePointIndices(s.points),
				edges: s.edges.map((e) => ({
					id: e.id,
					point1Id: e.point1Id,
					point2Id: e.point2Id,
					edgeModifications: e.edgeModifications.map((em) => ({
						id: em.id,
						type: em.edgeType,
						position: em.position ?? "Center",
						distance: em.distance ?? 0,
						depth: em.depth ?? 0,
						width: em.width ?? 0,
						sideAngleLeft: em.sideAngleLeft ?? 0,
						sideAngleRight: em.sideAngleRight ?? 0,
						fullRadiusDepth: em.fullRadiusDepth ?? 0,
						points: em.points ?? [],
					})),
				})),
				corners: s.corners.map((c) => ({
					id: c.id,
					pointId: c.pointId,
					type: c.type,
					clip: c.clip ?? 0,
					radius: c.radius ?? 0,
					modificationLength: c.modificationLength ?? 0,
					modificationDepth: c.modificationDepth ?? 0,
				})),
			}));

			const texts: CanvasText[] = result.texts.map((t) => ({
				id: t.id,
				xPos: t.xPos,
				yPos: t.yPos,
				text: t.text,
				fontSize: t.fontSize,
				isBold: t.isBold,
				isItalic: t.isItalic,
				textColor: t.textColor,
				backgroundColor: t.backgroundColor,
			}));

			return { id: result.id, name: result.name, shapes, texts };
		}),

	// Create a new design
	create: publicProcedure
		.input(
			z.object({
				name: z.string().min(1),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return ctx.db.design.create({
				data: {
					name: input.name,
				},
			});
		}),

	// Update design name
	update: publicProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string().min(1),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return ctx.db.design.update({
				where: { id: input.id },
				data: { name: input.name },
			});
		}),

	// Delete design
	delete: publicProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			return ctx.db.design.delete({
				where: { id: input.id },
			});
		}),

	// Create a new shape for a design
	createShape: publicProcedure
		.input(
			z.object({
				designId: z.string(),
				xPos: z.number(),
				yPos: z.number(),
				rotation: z.number().default(0),
				points: z.array(
					z.object({
						xPos: z.number(),
						yPos: z.number(),
					}),
				),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const shape = await ctx.db.shape.create({
				data: {
					designId: input.designId,
					xPos: input.xPos,
					yPos: input.yPos,
					rotation: input.rotation,
					points: {
						create: input.points.map((p) => ({
							xPos: p.xPos,
							yPos: p.yPos,
						})),
					},
				},
				select: {
					id: true,
					xPos: true,
					yPos: true,
					rotation: true,
					points: { select: { id: true, xPos: true, yPos: true } },
				},
			});

			// Calculate edge indices for the created shape
			return {
				...shape,
				edgeIndices: getShapeEdgePointIndices(shape.points),
			};
		}),

	// Update shape position only (preserves edges and modifications)
	updateShapePosition: publicProcedure
		.input(
			z.object({
				shapeId: z.string(),
				xPos: z.number(),
				yPos: z.number(),
				rotation: z.number().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const shape = await ctx.db.shape.update({
				where: { id: input.shapeId },
				data: {
					xPos: input.xPos,
					yPos: input.yPos,
					...(input.rotation !== undefined && { rotation: input.rotation }),
				},
				select: {
					id: true,
					xPos: true,
					yPos: true,
					rotation: true,
					points: { select: { id: true, xPos: true, yPos: true } },
				},
			});

			return shape;
		}),

	// Update shape position and points (WARNING: This recreates points, breaking edges)
	updateShape: publicProcedure
		.input(
			z.object({
				shapeId: z.string(),
				xPos: z.number(),
				yPos: z.number(),
				rotation: z.number().optional(),
				points: z.array(
					z.object({
						xPos: z.number(),
						yPos: z.number(),
					}),
				),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// Delete existing points and create new ones
			await ctx.db.point.deleteMany({
				where: { shapeId: input.shapeId },
			});

			const shape = await ctx.db.shape.update({
				where: { id: input.shapeId },
				data: {
					xPos: input.xPos,
					yPos: input.yPos,
					...(input.rotation !== undefined && { rotation: input.rotation }),
					points: {
						create: input.points.map((p) => ({
							xPos: p.xPos,
							yPos: p.yPos,
						})),
					},
				},
				select: {
					id: true,
					xPos: true,
					yPos: true,
					rotation: true,
					points: { select: { id: true, xPos: true, yPos: true } },
				},
			});

			return shape;
		}),

	// Delete shape
	deleteShape: publicProcedure
		.input(z.object({ shapeId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			return ctx.db.shape.delete({
				where: { id: input.shapeId },
			});
		}),

	// Create text
	createText: publicProcedure
		.input(textCreateSchema)
		.mutation(async ({ ctx, input }) => {
			return ctx.db.text.create({
				data: input,
			});
		}),
	updateText: publicProcedure
		.input(textUpdateSchema)
		.mutation(async ({ ctx, input }) => {
			return ctx.db.text.update({
				where: { id: input.id },
				data: input,
			});
		}),

	getAllTexts: publicProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			return ctx.db.text.findMany({
				where: { designId: input.id },
			});
		}),

	deleteText: publicProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			return ctx.db.text.delete({
				where: { id: input.id },
			});
		}),
	changeTextPosition: publicProcedure
		.input(z.object({ id: z.string(), xPos: z.number(), yPos: z.number() }))
		.mutation(async ({ ctx, input }) => {
			return ctx.db.text.update({
				where: { id: input.id },
				data: {
					xPos: input.xPos,
					yPos: input.yPos,
				},
			});
		}),
	setMaterialToShape: publicProcedure
		.input(z.object({ id: z.string(), materialId: z.string().nullable() }))
		.mutation(async ({ ctx, input }) => {
			return ctx.db.shape.update({
				where: { id: input.id },
				data: { materialId: input.materialId },
			});
		}),
	setMaterialToShapesWithoutMaterial: publicProcedure
		.input(
			z.object({ materialId: z.string().nullable(), designId: z.string() }),
		)
		.mutation(async ({ ctx, input }) => {
			return ctx.db.shape.updateMany({
				where: { materialId: null, designId: input.designId },
				data: { materialId: input.materialId },
			});
		}),
	setMaterialToAllShapes: publicProcedure
		.input(
			z.object({ materialId: z.string().nullable(), designId: z.string() }),
		)
		.mutation(async ({ ctx, input }) => {
			return ctx.db.shape.updateMany({
				where: { designId: input.designId },
				data: { materialId: input.materialId },
			});
		}),
	removeMaterialFromShapes: publicProcedure
		.input(z.object({ materialId: z.string(), designId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			return ctx.db.shape.updateMany({
				where: { materialId: input.materialId, designId: input.designId },
				data: { materialId: null },
			});
		}),
	getMaterialsByIds: publicProcedure
		.input(z.object({ ids: z.array(z.string()) }))
		.query(async ({ ctx, input }) => {
			return ctx.db.material.findMany({
				where: { id: { in: input.ids } },
			});
		}),
	getMaterialOptions: publicProcedure.query(async ({ ctx }) => {
		return ctx.db.material.findMany({
			select: {
				id: true,
				name: true,
				img: true,
				SKU: true,
				category: true,
				subcategory: true,
			},
		});
	}),
	createShapeEdge: publicProcedure
		.input(
			z.object({
				shapeId: z.string(),
				edgePoint1Id: z.string(),
				edgePoint2Id: z.string(),
				edgeModification: z.object({
					edgeType: z.nativeEnum(EdgeModificationType),
					position: z.nativeEnum(EdgeShapePosition),
					distance: z.number(),
					depth: z.number(),
					width: z.number(),
					sideAngleLeft: z.number(),
					sideAngleRight: z.number(),
					fullRadiusDepth: z.number().default(0),
					points: z.array(z.object({ xPos: z.number(), yPos: z.number() })),
				}),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const edge = await ctx.db.edge.create({
				data: {
					shapeId: input.shapeId,
					point1Id: input.edgePoint1Id,
					point2Id: input.edgePoint2Id,
				},
			});
			return await ctx.db.edgeModification.create({
				data: {
					edgeType: input.edgeModification.edgeType,
					position: input.edgeModification.position,
					distance: input.edgeModification.distance,
					depth: input.edgeModification.depth,
					width: input.edgeModification.width,
					sideAngleLeft: input.edgeModification.sideAngleLeft,
					sideAngleRight: input.edgeModification.sideAngleRight,
					fullRadiusDepth: input.edgeModification.fullRadiusDepth,
					edgeId: edge.id,
					points: {
						create: input.edgeModification.points.map((p) => ({
							xPos: p.xPos,
							yPos: p.yPos,
						})),
					},
				},
			});
		}),
	updateShapeEdge: publicProcedure
		.input(
			z.object({
				edgeId: z.string(),
				shapeId: z.string(),
				edgeModificationId: z.string().nullable(), // Is nullable because we can create a new edge modification or update an existing one
				edgeModification: z.object({
					edgeType: z.nativeEnum(EdgeModificationType),
					position: z.nativeEnum(EdgeShapePosition),
					distance: z.number(),
					depth: z.number(),
					width: z.number(),
					sideAngleLeft: z.number(),
					sideAngleRight: z.number(),
					fullRadiusDepth: z.number().default(0),
					points: z.array(z.object({ xPos: z.number(), yPos: z.number() })),
				}),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// If edge modification id is provided, update existing edge modification
			if (input.edgeModificationId) {
				// Delete old points first
				await ctx.db.point.deleteMany({
					where: {
						edgeModificationsPoints: {
							some: { id: input.edgeModificationId },
						},
					},
				});

				const result = await ctx.db.edgeModification.update({
						where: { id: input.edgeModificationId },
						data: {
						edgeType: input.edgeModification.edgeType,
						position: input.edgeModification.position,
						distance: input.edgeModification.distance,
						depth: input.edgeModification.depth,
						width: input.edgeModification.width,
						sideAngleLeft: input.edgeModification.sideAngleLeft,
						sideAngleRight: input.edgeModification.sideAngleRight,
						fullRadiusDepth: input.edgeModification.fullRadiusDepth,
							points: {
								create: input.edgeModification.points.map((p) => ({
									xPos: p.xPos,
									yPos: p.yPos,
								})),
							},
						},
				});
				return result;
			}
			
			const result = await ctx.db.edgeModification.create({
						data: {
					edgeType: input.edgeModification.edgeType,
					position: input.edgeModification.position,
					distance: input.edgeModification.distance,
					depth: input.edgeModification.depth,
					width: input.edgeModification.width,
					sideAngleLeft: input.edgeModification.sideAngleLeft,
					sideAngleRight: input.edgeModification.sideAngleRight,
					fullRadiusDepth: input.edgeModification.fullRadiusDepth,
							edgeId: input.edgeId,
							points: {
								create: input.edgeModification.points.map((p) => ({
									xPos: p.xPos,
									yPos: p.yPos,
								})),
							},
						},
				  });
			return result;
		}),

	removeShapeEdgeModification: publicProcedure
		.input(z.object({ edgeModificationId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			// Get the edge ID before updating
			const modification = await ctx.db.edgeModification.findUnique({
				where: { id: input.edgeModificationId },
				select: { edgeId: true },
			});

			const result = await ctx.db.edgeModification.update({
				where: { id: input.edgeModificationId },
				data: {
					edgeType: EdgeModificationType.None,
					position: "Center",
					distance: 0,
					depth: 0,
					width: 0,
					sideAngleLeft: 0,
					sideAngleRight: 0,
					fullRadiusDepth: 0,
				},
			});

			// Regenerate edge points
			if (modification) {
				await regenerateEdgePoints(ctx.db, modification.edgeId);
			}

			return result;
		}),

	edgeModificationUpdateSize: publicProcedure
		.input(
			z.object({
				edgeModificationId: z.string(),
				depth: z.number(),
				width: z.number(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// Get the edge ID
			const modification = await ctx.db.edgeModification.findUnique({
				where: { id: input.edgeModificationId },
				select: { edgeId: true },
			});

			const result = await ctx.db.edgeModification.update({
				where: { id: input.edgeModificationId },
				data: { depth: input.depth, width: input.width },
			});

			// Regenerate edge points
			if (modification) {
				await regenerateEdgePoints(ctx.db, modification.edgeId);
			}

			return result;
		}),
	edgeModificationUpdateAngles: publicProcedure
		.input(
			z.object({
				edgeModificationId: z.string(),
				sideAngleLeft: z.number(),
				sideAngleRight: z.number(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// Get the edge ID
			const modification = await ctx.db.edgeModification.findUnique({
				where: { id: input.edgeModificationId },
				select: { edgeId: true },
			});

			const result = await ctx.db.edgeModification.update({
				where: { id: input.edgeModificationId },
				data: {
					sideAngleLeft: input.sideAngleLeft,
					sideAngleRight: input.sideAngleRight,
				},
			});

			// Regenerate edge points
			if (modification) {
				await regenerateEdgePoints(ctx.db, modification.edgeId);
			}

			return result;
		}),
	edgeModificationUpdatePosition: publicProcedure
		.input(
			z.object({
				edgeModificationId: z.string(),
				position: z.nativeEnum(EdgeShapePosition),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// Get the edge ID
			const modification = await ctx.db.edgeModification.findUnique({
				where: { id: input.edgeModificationId },
				select: { edgeId: true },
			});

			const result = await ctx.db.edgeModification.update({
				where: { id: input.edgeModificationId },
				data: { position: input.position },
			});

			// Regenerate edge points
			if (modification) {
				await regenerateEdgePoints(ctx.db, modification.edgeId);
			}

			return result;
		}),
	edgeModificationUpdateDistance: publicProcedure
		.input(z.object({ edgeModificationId: z.string(), distance: z.number() }))
		.mutation(async ({ ctx, input }) => {
			// Get the edge ID
			const modification = await ctx.db.edgeModification.findUnique({
				where: { id: input.edgeModificationId },
				select: { edgeId: true },
			});

			const result = await ctx.db.edgeModification.update({
				where: { id: input.edgeModificationId },
				data: { distance: input.distance },
			});

			// Regenerate edge points
			if (modification) {
				await regenerateEdgePoints(ctx.db, modification.edgeId);
			}

			return result;
		}),
	edgeModificationUpdateFullRadiusDepth: publicProcedure
		.input(
			z.object({ edgeModificationId: z.string(), fullRadiusDepth: z.number() }),
		)
		.mutation(async ({ ctx, input }) => {
			return await ctx.db.edgeModification.update({
				where: { id: input.edgeModificationId },
				data: { fullRadiusDepth: input.fullRadiusDepth },
			});
		}),

	createCornerModification: publicProcedure
		.input(
			z.object({
				shapeId: z.string(),
				pointId: z.string(),
				type: z.nativeEnum(CornerType),
				clip: z.number().optional(),
				radius: z.number().optional(),
				modificationLength: z.number(),
				modificationDepth: z.number(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return await ctx.db.corner.create({
				data: {
					shapeId: input.shapeId,
					pointId: input.pointId,
					type: input.type,
					clip: input.clip ?? undefined,
					radius: input.radius ?? undefined,
					modificationLength: input.modificationLength ?? undefined,
					modificationDepth: input.modificationDepth ?? undefined,
				},
			});
		}),

	updateCornerModification: publicProcedure
		.input(
			z.object({
				cornerId: z.string(),
				type: z.nativeEnum(CornerType),
				clip: z.number().optional(),
				radius: z.number().optional(),
				modificationLength: z.number(),
				modificationDepth: z.number(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return await ctx.db.corner.update({
				where: { id: input.cornerId },
				data: {
					type: input.type,
					clip: input.clip ?? undefined,
					radius: input.radius ?? undefined,
					modificationLength: input.modificationLength ?? undefined,
					modificationDepth: input.modificationDepth ?? undefined,
				},
			});
		}),
	deleteCornerModification: publicProcedure
		.input(z.object({ cornerId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			return await ctx.db.corner.update({
				where: { id: input.cornerId },
				data: {
					type: CornerType.None,
					clip: undefined,
					radius: undefined,
					modificationLength: undefined,
					modificationDepth: undefined,
				},
			});
		}),
	updateCornerRadius: publicProcedure
		.input(z.object({ cornerId: z.string(), radius: z.number() }))
		.mutation(async ({ ctx, input }) => {
			return await ctx.db.corner.update({
				where: { id: input.cornerId },
				data: { radius: input.radius },
			});
		}),
	updateCornerLength: publicProcedure
		.input(z.object({ cornerId: z.string(), length: z.number() }))
		.mutation(async ({ ctx, input }) => {
			return await ctx.db.corner.update({
				where: { id: input.cornerId },
				data: { modificationLength: input.length },
			});
		}),
	updateCornerDepth: publicProcedure
		.input(z.object({ cornerId: z.string(), depth: z.number() }))
		.mutation(async ({ ctx, input }) => {
			return await ctx.db.corner.update({
				where: { id: input.cornerId },
				data: { modificationDepth: input.depth },
			});
		}),
	updateCornerClip: publicProcedure
		.input(z.object({ cornerId: z.string(), clip: z.number() }))
		.mutation(async ({ ctx, input }) => {
			return await ctx.db.corner.update({
				where: { id: input.cornerId },
				data: { clip: input.clip },
			});
		}),
});
