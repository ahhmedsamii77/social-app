import { Model } from "mongoose";
import { DBRepository } from "./db.repository";
import { CommentType } from "../../utils";

export class CommentRepository extends DBRepository<CommentType> {
  constructor(protected readonly model: Model<CommentType>) {
    super(model);
  }
}