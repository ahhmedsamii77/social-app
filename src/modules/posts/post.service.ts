import { NextFunction, Request, Response } from "express";
import { postModel } from "../../DB/models/post.model";
import { userModel } from "../../DB/models/user.model";
import { PostRepository } from "../../DB/repositories/post.repository";
import { UserRepository } from "../../DB/repositories/user.repository";
import { AppError, AvailaabilityType } from "../../utils";
import { deleteFiles, uploadFiles } from "../../utils/aws";
import { v4 as uuid } from "uuid"
import { Types } from "mongoose";
class PostService {
    private _postModel = new PostRepository(postModel);
    private _userModel = new UserRepository(userModel);

    constructor() { }

    // create post 
    createPost = async (req: Request, res: Response, next: NextFunction) => {
        const users = await this._userModel.find({ _id: { $in: req.body?.tags } });
        if (req.body?.tags?.length && users.length !== req.body?.tags?.length) {
            throw new AppError("Invalid user id", 400);
        }
        const assetFolderId = uuid();
        let attachments: string[] = []
        if (req.body?.attachments?.length) {
            attachments = await uploadFiles({
                files: req.files as Express.Multer.File[],
                path: `users/posts/${assetFolderId}`
            });
        }
        const post = await this._postModel.create({
            ...req.body,
            attachments,
            assetFolderId,
            createdBy: req?.user?._id
        });
        return res.status(201).json({ message: "Post created successfully", post });
    }

    // like post
    likePost = async (req: Request, res: Response, next: NextFunction) => {
        const { postId } = req.params;
        const post = await this._postModel.findById(postId as unknown as Types.ObjectId);
        if (!post) throw new AppError("Post not found", 404);
        const isLiked = post.likes.includes(req?.user?._id as unknown as Types.ObjectId);
        let updateQuery = isLiked ? { $pull: { likes: req?.user?._id } } : { $addToSet: { likes: req?.user?._id } };
        const updatedPost = await this._postModel.findOneAndUpdate({
            _id: postId, $or: [
                { availability: AvailaabilityType.Public },
                { availability: AvailaabilityType.Private, createdBy: req?.user?._id },
                { availability: AvailaabilityType.Friends, createdBy: { $in: [...req?.user?.friends || [], req?.user?._id] } },
            ]
        }, updateQuery);
        if (!updatedPost) throw new AppError("You can't like this post", 404);
        return res.status(200).json({ message: isLiked ? "Post disliked successfully" : "Post liked successfully", updatedPost });
    }

    // update post
    updatePost = async (req: Request, res: Response, next: NextFunction) => {
        const { postId } = req.params;
        const post = await this._postModel.findOne({ _id: postId, createdBy: req?.user?._id, paranoid: false });
        if (!post) throw new AppError("Post not found", 404);
        if (req.body?.content) post.content = req.body.content;
        if (req.body?.allowComments) post.allowComments = req.body.allowComments;
        if (req.body?.availability) post.availability = req.body.availability;
        if (req?.files?.length) {
            await deleteFiles({
                Keys: post.attachments!,
            });
            const attachments = await uploadFiles({
                files: req.files as Express.Multer.File[],
                path: `users/posts/${post.assetFolderId}`
            })
            post.attachments = attachments;
        }
        if (req.body?.tags?.length) {
            const users = await this._userModel.find({ _id: { $in: req.body?.tags } });
            if (req.body?.tags?.length && users.length !== req.body?.tags?.length) {
                throw new AppError("Invalid user id", 400);
            }
            post.tags = req.body.tags;
        }
        await post.save();
        return res.status(200).json({ message: "Post updated successfully", post });
    }

    // get posts
    getPosts = async (req: Request, res: Response, next: NextFunction) => {
        let { page, limit } = req.query as unknown as { page: number, limit: number };
        const { docs, currentPage, count, numberOfPages } = await this._postModel.paginate({
            filter: {}, query: { limit, page },
            options: {
                populate: [
                    {
                        path: "comments",
                        match: { commentId: { $exists: false } },
                        populate: [
                            {
                                path: "replies",
                            }
                    ]
                    }
                ]
            }
        });
        return res.status(200).json({ message: "Posts fetched successfully", currentPage, count, numberOfPages, posts: docs });
    }
}
export default new PostService();
