import { Router } from "express";
import * as CV from "./comment.valiation";
import CS from "./comment.service";
import { allowedExtension, authentication, multerCloud, validation } from "../../middleware";
export const commmentRouter = Router({ mergeParams: true });


// create comment 
commmentRouter.post("/", authentication(), multerCloud({ fileTypes: allowedExtension.image }).array("attachments", 2), validation(CV.createCommentSchema), CS.createComment);

