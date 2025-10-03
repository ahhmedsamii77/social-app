import mongoose from "mongoose";
import { GenderType, ProviderType, RoleType, UserType } from "../../utils";

const userShema = new mongoose.Schema<UserType>({
  fName: { type: String, required: true },
  lName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: {
    type: String, required: function () {
      return this.provider == ProviderType.SYSTEM ? true : false
    }
  },
  age: {
    type: Number, required: function () {
      return this.provider == ProviderType.SYSTEM ? true : false
    }
  },
  phone: {
    type: String, required: function () {
      return this.provider == ProviderType.SYSTEM ? true : false
    }
  },
  address: { type: String },
  profileImage: { type: String },
  tempProfileImage: { type: String },
  gender: { type: String, enum: GenderType, default: GenderType.MALE },
  role: { type: String, enum: RoleType, default: RoleType.USER },
  otp: { type: String },
  confirmed: { type: Boolean, default: false },
  provider: { type: String, enum: ProviderType, default: ProviderType.SYSTEM },
  changeCredentials: { type: Date },
  deletedAt: { type: Date },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  reStoredAt: { type: Date },
  reStoredBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  friends: { type: mongoose.Schema.Types.ObjectId, ref: "users" }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


userShema.virtual("fullName").set(function (value) {
  const [fName, lName] = value.split(" ");
  this.set({ fName, lName });
}).get(function () {
  return this.fName + " " + this.lName;
});

export const userModel = mongoose.models.users || mongoose.model<UserType>("users", userShema);