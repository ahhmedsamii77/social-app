import z from "zod";
import { generalRules, OnModelType } from "../../utils";
export const createCommentSchema = {
    body: z.object({
        content: z.string().min(3, { message: "content must be at least 3 characters long" }).optional(),
        attachments: z.array(generalRules.file).optional(),
        onModel: z.enum([OnModelType.Post, OnModelType.Comment]),
        tags: z.array(generalRules.id).refine((data) => data.length === new Set(data).size, { message: "Duplicate tags" }).optional(),
    }).superRefine((data, ctx) => {
        if (!data?.content && data.attachments?.length === 0) {
            ctx.addIssue({
                code: 'custom',
                message: "Comment must have content or attachments",
                path: ['content', 'attachments']
            })
        }
    }),
    params: z.object({
        postId: generalRules.id,
        commentId: generalRules.id.optional()
    })
} 