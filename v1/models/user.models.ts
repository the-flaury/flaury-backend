import { models, model, Schema } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, requried: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    accountType: { type: String, default: "customer" },
    isVerified: { type: Boolean, default: false },
    lastLogin: { type: Date, default: Date.now() },
    verificationToken: String,
    verificationTokenExpiresAt: Date,
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
  },
  { timestamps: true }
);

const User = models.User || model("User", UserSchema);
export default User;
