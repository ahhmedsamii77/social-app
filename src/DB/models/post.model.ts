import mongoose from "mongoose";
import { AllowCommentsType, AvailaabilityType, PostType } from "../../utils";

const postSchema = new mongoose.Schema<PostType>({
    content: { type: String, required: function () { return this?.attachments?.length === 0 } },
    attachments: { type: [String] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "users" },
    allowComments: { type: String, enum: AllowCommentsType, default: AllowCommentsType.Allow },
    availability: { type: String, enum: AvailaabilityType, default: AvailaabilityType.Public },
    assetFolderId: { type: String },
    deletedAt: { type: Date },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    reStoredAt: { type: Date },
    reStoredBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    tags: { type: [mongoose.Schema.Types.ObjectId], ref: "users" },
    likes: { type: [mongoose.Schema.Types.ObjectId], ref: "users" },
}, {
    timestamps: true,
    strictQuery: true,
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    }
});


postSchema.pre(["find", "findOne", "findOneAndUpdate"], async function () {
    const query = this.getQuery();
    const { paranoid, ...rest } = query;
    if (paranoid == false) {
        this.setQuery({
            ...rest,
        });
    } else {
        this.setQuery({
            ...rest,
            deletedAt: { $exists: false }
        });
    }
});


postSchema.virtual("comments", {
    ref: "comments",
    localField: "_id",
    foreignField: "refId"
})

export const postModel = mongoose.models.posts || mongoose.model<PostType>("posts", postSchema);