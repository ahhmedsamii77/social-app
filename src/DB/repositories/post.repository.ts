import { Model } from "mongoose";
import { DBRepository } from "./db.repository";
import { PostType } from "../../utils";

export class PostRepository extends DBRepository<PostType> {
  constructor(protected readonly model: Model<PostType>) {
    super(model);
  }
}