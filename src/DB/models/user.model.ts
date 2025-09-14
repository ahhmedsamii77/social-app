import mongoose from "mongoose";
import { GenderType, ProviderType, RoleType, UserType } from "../../utils";

const userSchema = new mongoose.Schema<UserType>({
  fName: { type: String, required: true },
  lName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: {
    type: String, required: function () {
      return this.provider == ProviderType.System ? true : false
    }
  },
  age: {
    type: Number, required: function () {
      return this.provider == ProviderType.System ? true : false
    }
  },
  phone: {
    type: String, required: function () {
      return this.provider == ProviderType.System ? true : false
    }
  },
  address: { type: String },
  image: { type: String },
  otp: { type: String },
  confirmed: { type: Boolean },
  gender: { type: String, enum: GenderType, default: GenderType.Male },
  role: { type: String, enum: RoleType, default: RoleType.User },
  provider: { type: String, enum: ProviderType, default: ProviderType.System },
  changeCredentials: { type: Date }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

userSchema.virtual("fullName").set(function (value) {
  const [fName, lName] = value.split(" ");
  this.set({ fName, lName });
}).get(function () {
  return `${this.fName} ${this.lName}`
});

export const userModel = mongoose.models.users || mongoose.model<UserType>("users", userSchema);