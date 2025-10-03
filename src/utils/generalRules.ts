import { Types } from 'mongoose';
import z from 'zod';

export const generalRules = {
    id: z.string().refine((value) => Types.ObjectId.isValid(value), { message: "Invalid ID" }),
    file: z.object({
        originalname: z.string(),
        size: z.number(),
        path: z.string().optional(),
        buffer: z.any().optional(),
        mimetype: z.string(),
        encoding: z.string(),
    })
}