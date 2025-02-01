import { z } from 'zod';

export const itemSchema = z.object({
	id: z.number(),
	name: z.string().min(1, {
		message: 'Name must be at least 1 character',
	}),
	image_url: z.union([
		z.string().url('Invalid image URL'),
		z.string().length(0),
		z.null()
	]),
	description: z
		.string()
		.max(500, { message: 'Description must not be longer than 500 characters' })
		.nullable(),
	category_name: z.string().nullable(),
	category_id: z.number().nullable(),
});

export type ItemFormValues = z.infer<typeof itemSchema>;
