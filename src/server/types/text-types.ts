import z from "zod";

export const textCreateSchema = z.object({
	designId: z.string().min(1),
	xPos: z.number(),
	yPos: z.number(),
	text: z.string().min(1),
	fontSize: z.number().min(1),
	isBold: z.boolean(),
	isItalic: z.boolean(),
	textColor: z.string().min(1),
	backgroundColor: z.string().min(1),
});

export const textUpdateSchema = z.object({
	id: z.string().min(1),
	xPos: z.number(),
	yPos: z.number(),
	text: z.string().min(1),
	fontSize: z.number().min(1),
	isBold: z.boolean(),
	isItalic: z.boolean(),
	textColor: z.string().min(1),
	backgroundColor: z.string().min(1),
});
