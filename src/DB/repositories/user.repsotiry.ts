import { HydratedDocument, Model } from "mongoose";
import { UserType } from "../../utils";
import { DBRepository } from "./db.repository";

export class UserRepsotiry extends DBRepository<UserType> {
  constructor(protected readonly model: Model<UserType>) {
    super(model);
  }
  async createOneUser(data: Partial<UserType>): Promise<HydratedDocument<UserType>> {
    const user = await this.model.create(data);
    return user;
  }
}