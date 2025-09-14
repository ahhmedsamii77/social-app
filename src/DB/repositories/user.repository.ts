import { Model } from "mongoose";
import { DbRepository } from "./Db.repository";
import { UserType } from "../../utils";

export class UserRepository extends DbRepository<UserType> {
  constructor(protected readonly model: Model<UserType>) {
    super(model);
  }
}