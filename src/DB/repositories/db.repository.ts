import { RootFilterQuery, ProjectionType, Types } from "mongoose";
import { HydratedDocument, Model } from "mongoose";

export class DbRepository<TDocument> {
  constructor(protected readonly model: Model<TDocument>) { }
  create = async (data: Partial<TDocument>): Promise<HydratedDocument<TDocument>> => {
    return this.model.create(data);
  }
  findOne = async (filter: RootFilterQuery<TDocument>, select?: ProjectionType<TDocument>): Promise<HydratedDocument<TDocument> | null> => {
    return this.model.findOne(filter, select);
  }
  findById = async (id: Types.ObjectId, select?: ProjectionType<TDocument>): Promise<HydratedDocument<TDocument> | null> => {
    return this.model.findById(id, select);
  }
}