import { EdgeModificationType, EdgeShapePosition } from "@prisma/client";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { textCreateSchema, textUpdateSchema } from "~/server/types/text-types";
import type { CanvasShape, CanvasText } from "~/types/drawing";
import { getShapeEdgePointIndices } from "~/utils/shape-utils";

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
										},
									},
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
					})),
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

	// Update shape position and points
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
					...input.edgeModification,
					edgeId: edge.id,
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
				}),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// If edge modification id is provided, update existing edge modification
			if (input.edgeModificationId) {
				return await ctx.db.edgeModification.update({
					where: { id: input.edgeModificationId },
					data: input.edgeModification,
				});
			}
			return await ctx.db.edgeModification.create({
				data: {
					...input.edgeModification,
					edgeId: input.edgeId,
				},
			});
		}),

	removeShapeEdgeModification: publicProcedure
		.input(z.object({ edgeModificationId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			return await ctx.db.edgeModification.update({
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
			return await ctx.db.edgeModification.update({
				where: { id: input.edgeModificationId },
				data: { depth: input.depth, width: input.width },
			});
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
			return await ctx.db.edgeModification.update({
				where: { id: input.edgeModificationId },
				data: {
					sideAngleLeft: input.sideAngleLeft,
					sideAngleRight: input.sideAngleRight,
				},
			});
		}),
	edgeModificationUpdatePosition: publicProcedure
		.input(
			z.object({
				edgeModificationId: z.string(),
				position: z.nativeEnum(EdgeShapePosition),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return await ctx.db.edgeModification.update({
				where: { id: input.edgeModificationId },
				data: { position: input.position },
			});
		}),
	edgeModificationUpdateDistance: publicProcedure
		.input(z.object({ edgeModificationId: z.string(), distance: z.number() }))
		.mutation(async ({ ctx, input }) => {
			return await ctx.db.edgeModification.update({
				where: { id: input.edgeModificationId },
				data: { distance: input.distance },
			});
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
});
