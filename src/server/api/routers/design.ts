import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
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

	// Create text
	createText: publicProcedure
		.input(
			z.object({
				designId: z.string().min(1),
				xPos: z.number(),
				yPos: z.number(),
				text: z.string().min(1),
				fontSize: z.number().min(1),
				isBold: z.boolean(),
				isItalic: z.boolean(),
				textColor: z.string().min(1),
				backgroundColor: z.string().min(1),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return ctx.db.text.create({
				data: {
					xPos: input.xPos,
					yPos: input.yPos,
					text: input.text,
					fontSize: input.fontSize,
					isBold: input.isBold,
					isItalic: input.isItalic,
					textColor: input.textColor,
					backgroundColor: input.backgroundColor,
					designId: input.designId,
				},
			});
		}),
	updateText: publicProcedure
		.input(
			z.object({
				id: z.string().min(1),
				xPos: z.number(),
				yPos: z.number(),
				text: z.string().min(1),
				fontSize: z.number().min(1),
				isBold: z.boolean(),
				isItalic: z.boolean(),
				textColor: z.string().min(1),
				backgroundColor: z.string().min(1),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return ctx.db.text.update({
				where: { id: input.id },
				data: {
					xPos: input.xPos,
					yPos: input.yPos,
					text: input.text,
					fontSize: input.fontSize,
					isBold: input.isBold,
					isItalic: input.isItalic,
					textColor: input.textColor,
					backgroundColor: input.backgroundColor,
				},
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
});
