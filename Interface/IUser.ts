// src/interfaces/IUser.ts
import { Document } from "mongoose";

export interface IUser extends Document {
  firstName?: string;
  lastName?: string;
  username?: string;
  email: string;
  phone?: number;
  password?: string;
  googleId?: string;
  displayName?: string;
  isAdmin?: boolean;
  isBlocked?: boolean;
  profilePicture?: String;
  bio?: string;
}
