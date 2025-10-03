import { Model } from "mongoose";
import { RevokeTokenType } from "../../utils";
import { DBRepository } from "./db.repository";

export class RevokeTokenRepository extends DBRepository<RevokeTokenType> {
  constructor(protected readonly model: Model<RevokeTokenType>) {
    super(model);
  }
}