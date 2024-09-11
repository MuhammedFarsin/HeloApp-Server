import mongoose, { Document, Schema } from "mongoose";

interface IUser extends Document {
  username : string,
  email : string,
  phone : number,
  isAdmin? : boolean,
  isBlocked? : boolean
}

const userSchema : Schema<IUser> = new Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
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
