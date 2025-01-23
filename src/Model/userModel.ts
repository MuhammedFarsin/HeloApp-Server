// src/models/userModel.ts
import mongoose, { Schema } from "mongoose";
import { IUser } from "../Interface/IUser";

// Define the user schema
const userSchema: Schema<IUser> = new Schema({
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  helo_id: {
    type: String,
  },
  username: {
    type: String,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  password: {
    type: String,
    // required: true,
  },
  googleId: {
    type: String,
    sparse: true,
    default: null,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  bio: {
    type: String,
  },
  profilePicture: {
    type: String,
  },
  status: {
    type: String,
    enum: ["ACTIVE", "BLOCKED"],
    default: "ACTIVE",
  },
});

// Create the User model from the schema
const User = mongoose.model<IUser>("User", userSchema);

export default User;