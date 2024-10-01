import mongoose, { Document, Schema } from "mongoose";

interface IUser extends Document {
  username?: string;
  email: string;
  phone?: number;
  password?: string;
  googleId?: string;
  displayName?: string;
  isAdmin?: boolean;
  isBlocked?: boolean;
}

const userSchema: Schema<IUser> = new Schema({
  username: {
    type: String,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
  },
  password: {
    type: String,
    required: true
  },
  googleId: {
    type: String,
  },
  displayName: {
    type: String,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
});

const User = mongoose.model<IUser>("User", userSchema);

export default User;
