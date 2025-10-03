import { Model } from "mongoose";
import { UserType } from "../../utils";
import { DBRepository } from "./db.repository";

export class UserRepository extends DBRepository<UserType> {
  constructor(protected readonly model: Model<UserType>) {
    super(model);
  }
}