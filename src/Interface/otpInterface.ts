
import { IUser } from "./IUser";

  
  export interface OtpStoreEntry {
    otp: string;
    expiresIn: number;
    tempUser: Partial<IUser>;
  }
  
  export interface ResetPasswordOtpEntry {
    otp: string;
    expiresIn: number;
  }
  