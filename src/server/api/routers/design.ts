import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { textCreateSchema, textUpdateSchema } from "~/server/types/text-types";
import type { CanvasShape } from "~/types/drawing";

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
							points: { select: { xPos: true, yPos: true } },
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
			}));

			return { id: result.id, name: result.name, shapes };
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
					points: { select: { xPos: true, yPos: true } },
				},
			});

			return shape;
		}),

	// Update shape position and points
	updateShape: publicProcedure
		.input(
			z.object({
				shapeId: z.string(),
				xPos: z.number(),
				yPos: z.number(),
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
					points: { select: { xPos: true, yPos: true } },
				},
			});

			return shape;
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
});
