import mongoose from "mongoose";
import { CommentType, OnModelType } from "../../utils";

const commentSchema = new mongoose.Schema<CommentType>({
    content: { type: String, required: function () { return this?.attachments?.length === 0 } },
    attachments: { type: [String] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "users" },
    deletedAt: { type: Date },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    reStoredAt: { type: Date },
    reStoredBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    tags: { type: [mongoose.Schema.Types.ObjectId], ref: "users" },
    likes: { type: [mongoose.Schema.Types.ObjectId], ref: "users" },
    assetFolderId: { type: String },
    refId: { type: mongoose.Schema.Types.ObjectId, refPath: "onModel", required: true },
    onModel: { type: String, enum: OnModelType, required: true }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    }
});


commentSchema.virtual("replies", {
    ref: "comments",
    localField: "_id",
    foreignField: "refId",
})

export const commentModel = mongoose.models.comments || mongoose.model<CommentType>("comments", commentSchema);