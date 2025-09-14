import { Model } from "mongoose";
import { RevokeTokenType } from "../../utils";
import { DbRepository } from "./Db.repository";

export class RevokeTokenRepository extends DbRepository<RevokeTokenType> {
  constructor(protected readonly model: Model<RevokeTokenType>) {
    super(model);
  }
}