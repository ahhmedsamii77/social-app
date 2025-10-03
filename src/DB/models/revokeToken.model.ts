import mongoose from "mongoose";
import { RevokeTokenType } from "../../utils";

const revokeTokenShema = new mongoose.Schema<RevokeTokenType>({
  idToken: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "users" },
  expireIn: { type: Date, required: true },
}, {
  timestamps: true,
});

export const revokeTokenModel = mongoose.models.revokeTokens || mongoose.model<RevokeTokenType>("revokeTokens", revokeTokenShema);