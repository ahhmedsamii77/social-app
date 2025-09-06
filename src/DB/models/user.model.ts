import mongoose from "mongoose";
import { GenderType, RoleType, UserType } from "../../utils/index";


const userSchema = new mongoose.Schema<UserType>({
  fName: { type: String, required: true },
  lName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  age: { type: Number, required: true },
  address: { type: String },
  phone: { type: String },
  gender: { type: String, enum: GenderType, default: GenderType.Male },
  role: { type: String, enum: RoleType, default: RoleType.User },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

userSchema.virtual("userName").set(function (value) {
  const [fName, lName] = value.split(" ");
  this.set({ fName, lName });
}).get(function () {
  return `${this.fName} ${this.lName}`;
});

export const userModel = mongoose.models.users || mongoose.model<UserType>("users", userSchema);