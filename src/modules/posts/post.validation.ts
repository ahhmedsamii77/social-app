import z from "zod";
import { AllowCommentsType, AvailaabilityType, generalRules } from "../../utils";
export const createPostSchema = {
    body: z.object({
        content: z.string().min(3, { message: "Post content must be at least 3 characters long" }).max(1000, { message: "Post content is too long" }).optional(),
        attachments: z.array(generalRules.file).optional(),
        tags: z.array(generalRules.id).refine((data) => new Set(data).size === data.length, { message: "Duplicate tags" }).optional(),
        likes: z.array(generalRules.id).optional(),
        allowComments: z.enum([AllowCommentsType.Allow, AllowCommentsType.Deny]).optional(),
        availability: z.enum([AvailaabilityType.Private, AvailaabilityType.Friends, AvailaabilityType.Public]).optional(),
    }).superRefine((data, ctx) => {
        if (!data?.content && data.attachments?.length === 0) {
            ctx.addIssue({
                code: 'custom',
                message: "Post must have content or attachments",
                path: ['content', 'attachments']
            })
        }
    })
}

export const likePostSchema = {
    params: z.object({
        postId: generalRules.id
    })
}


export const updatePostSchema = {
    params: z.object({
        postId: generalRules.id
    }),
    body: z.object({
        content: z.string().min(3, { message: "Post content must be at least 3 characters long" }).max(1000, { message: "Post content is too long" }).optional(),
        attachments: z.array(generalRules.file).optional(),
        tags: z.array(generalRules.id).refine((data) => new Set(data).size === data.length, { message: "Duplicate tags" }).optional(),
        likes: z.array(generalRules.id).optional(),
        allowComments: z.enum([AllowCommentsType.Allow, AllowCommentsType.Deny]).optional(),
        availability: z.enum([AvailaabilityType.Private, AvailaabilityType.Friends, AvailaabilityType.Public]).optional(),
    }).superRefine((data, ctx) => {
        if (!data) {
            ctx.addIssue({
                code: 'custom',
                message: "You must provide at least one field to update",
            })
        }
    })
}
