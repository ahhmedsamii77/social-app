import { NextFunction, Request, Response } from "express";
import { commentModel } from "../../DB/models/comment.model";
import { postModel } from "../../DB/models/post.model";
import { userModel } from "../../DB/models/user.model";
import { CommentRepository } from "../../DB/repositories/commet.repository";
import { PostRepository } from "../../DB/repositories/post.repository";
import { UserRepository } from "../../DB/repositories/user.repository";
import { AllowCommentsType, AppError, AvailaabilityType, CommentType, OnModelType, PostType } from "../../utils";
import { deleteFiles, uploadFiles } from "../../utils/aws";
import { v4 as uuid } from "uuid";
import { HydratedDocument, Types } from "mongoose";
import { populate } from "dotenv";
export class CommentService {
    private _commentModel = new CommentRepository(commentModel);
    private _postModel = new PostRepository(postModel);
    private _userModel = new UserRepository(userModel);
    constructor() { }

    // create comment
    createComment = async (req: Request, res: Response, next: NextFunction) => {
        const { postId, commentId } = req.params;
        let { content, attachments, tags, onModel } = req.body;
        let doc: HydratedDocument<PostType | CommentType> | null = null;
        if (commentId || onModel == OnModelType.Comment) {
            const comment = await this._commentModel.findOne({ _id: commentId, refId: postId as unknown as Types.ObjectId },
                undefined,
                {
                    populate: "refId",
                    match: {
                        allowComments: AllowCommentsType.Allow,
                        $or: [
                            { availability: AvailaabilityType.Public },
                            { availability: AvailaabilityType.Private, createdById: req?.user?._id },
                            { availability: AvailaabilityType.Friends, createdById: { $in: [...req?.user?.friends || [], req?.user?._id] } },
                        ]
                    }
                }
            );
            if (!comment) throw new AppError("Comment not found", 404);
            doc = comment;
        } else if (onModel == OnModelType.Post) {
            const post = await this._postModel.findOne({
                _id: postId,
                allowComments: AllowCommentsType.Allow,
                $or: [
                    { availability: AvailaabilityType.Public },
                    { availability: AvailaabilityType.Private, createdById: req?.user?._id },
                    { availability: AvailaabilityType.Friends, createdById: { $in: [...req?.user?.friends || [], req?.user?._id] } }
                ]
            });
            if (!post) throw new AppError("Post not found", 404);
            doc = post;
        }

        if (tags?.length) {
            const users = await this._userModel.find({ _id: { $in: tags } })
            if (users.length !== tags.length) {
                throw new AppError("User not found", 404)
            }
        }
        const assetFolderId = uuid();
        if (attachments?.length) {
            attachments = await uploadFiles({
                files: req.files as Express.Multer.File[],
                path: `users/${req?.user?._id}/posts/${doc?.assetFolderId}/comments/${assetFolderId}`
            });
        }
        const comment = await this._commentModel.create({
            attachments,
            content,
            tags,
            onModel,
            refId: doc?._id as unknown as Types.ObjectId,
            createdBy: req?.user?._id as unknown as Types.ObjectId,
            assetFolderId
        });
        if (!comment) {
            await deleteFiles({
                Keys: attachments || []
            });
            throw new AppError("Comment not created", 400);
        }
        return res.status(201).json({ message: "Comment created successfully", comment });
    }

    // create reply
    // createReply = async (req: Request, res: Response, next: NextFunction) => {
    //     const { commentId, postId } = req.params;
    //     let { content, attachments, tags } = req.body;
    //     const comment = await this._commentModel.findOne({ _id: commentId, postId: postId as unknown as Types.ObjectId })
    //     if (!comment) throw new AppError("Comment not found", 404);
    //     const assetFolderId = uuid();
    //     if (attachments?.length) {
    //         attachments = await uploadFiles({
    //             files: req.files as Express.Multer.File[],
    //             path: `users/${req?.user?._id}/posts/${comment?.postId}/comments/${comment?.assetFolderId}/${assetFolderId}`
    //         });
    //     }
    //     if (tags?.length) {
    //         const users = await this._userModel.find({ _id: { $in: tags } })
    //         if (users.length !== tags.length) {
    //             throw new AppError("User not found", 404)
    //         }
    //     }
    //     const reply = await this._commentModel.create({
    //         attachments,
    //         content,
    //         tags,
    //         postId: comment?.postId as unknown as Types.ObjectId,
    //         createdBy: req?.user?._id as unknown as Types.ObjectId,
    //         assetFolderId,
    //         commentId: comment?._id as unknown as Types.ObjectId
    //     });
    //     if (!reply) {
    //         await deleteFiles({
    //             Keys: attachments || []
    //         });
    //         throw new AppError("Reply not created", 400);
    //     }
    //     return res.status(201).json({ message: "Reply created successfully", reply });
    // }


}


export default new CommentService();
