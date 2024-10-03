// interfaces.ts

import { IUser } from "./IUser";

  
  // Interface for the OTP store entry with expiration time
  export interface OtpStoreEntry {
    otp: string;
    expiresIn: number;
    tempUser: Partial<IUser>; // Include newUser as Partial<IUser>
  }
  
  // Interface for the Reset Password OTP store
  export interface ResetPasswordOtpEntry {
    otp: string;
    expiresIn: number;
  }
  