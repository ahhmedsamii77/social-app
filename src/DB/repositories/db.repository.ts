import { DeleteResult, Types } from "mongoose";
import { QueryOptions } from "mongoose";
import { UpdateQuery } from "mongoose";
import { ProjectionType, RootFilterQuery } from "mongoose";
import { HydratedDocument, Model } from "mongoose";

export abstract class DBRepository<TDocument> {
  constructor(protected readonly model: Model<TDocument>) { }
  create = (data: Partial<TDocument>): Promise<HydratedDocument<TDocument>> => {
    return this.model.create(data);
  }
  findOne = (filter: RootFilterQuery<TDocument>, select?: ProjectionType<TDocument>, options?: QueryOptions<TDocument>): Promise<HydratedDocument<TDocument> | null> => {
    return this.model.findOne(filter, select, options);
  }
  findById = (id: Types.ObjectId): Promise<HydratedDocument<TDocument> | null> => {
    return this.model.findById(id);
  }
  find = (filter: RootFilterQuery<TDocument>, select?: ProjectionType<TDocument>, options?: QueryOptions<TDocument>): Promise<HydratedDocument<TDocument>[]> => {
    return this.model.find(filter, select, options);
  }
  paginate = async ({ filter, select, query, options }: { filter: RootFilterQuery<TDocument>, query: { page: number, limit: number }, select?: ProjectionType<TDocument>, options?: QueryOptions<TDocument> }) => {
    let { limit, page } = query;
    limit = Number(limit) || 5;
    page = Number(page) || 1;
    if (limit < 0) limit = 5;
    if (page < 0) page = 1;
    const skip = (page - 1) * limit;
    const finalOptions = {
      ...options,
      skip,
      limit
    }
    const count = await this.model.countDocuments({ deletedAt: { $exists: false } });
    const numberOfPages = Math.ceil(count / limit);
    const docs = await this.model.find(filter, select, finalOptions);
    return { docs, currentPage: page, count , numberOfPages };
  }
  findOneAndUpdate = (filter: RootFilterQuery<TDocument>, update: UpdateQuery<TDocument>): Promise<HydratedDocument<TDocument> | null> => {
    return this.model.findOneAndUpdate(filter, update, { new: true });
  }
  deleteOne = (filter: RootFilterQuery<TDocument>): Promise<DeleteResult> => {
    return this.model.deleteOne(filter);
  }
}