import { Router } from "express";
import * as UV from "./post.validation";
import US from "./post.service"
import { validation, authentication, multerCloud, allowedExtension } from "../../middleware";
import { commmentRouter } from "../comments/comment.controller";
export const postRouter = Router();

// comments
postRouter.use("/:postId/comments{/:commentId/reply}", commmentRouter);

// create post
postRouter.post("/", authentication(), multerCloud({ fileTypes: allowedExtension.image }).array("attachments", 2), validation(UV.createPostSchema), US.createPost);


// like post
postRouter.patch("/like/:postId", authentication(), validation(UV.likePostSchema), US.likePost);

// update post
postRouter.patch("/:postId", authentication(), multerCloud({ fileTypes: allowedExtension.image }).array("attachments", 2), validation(UV.updatePostSchema), US.updatePost);


// get posts
postRouter.get("/" ,US.getPosts);