import express, { Router } from "express";
import session from "express-session";
import * as authController from "../Controllers/authController";
import {updateUserid} from "../Controllers/userController";
import dotenv from "dotenv";

dotenv.config();

const userRoute: Router = express.Router();
const sessionSecret = process.env.SESSION_SECRET || "HELOAPP-SECRET";

userRoute.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 60000 },
  })
);

userRoute.post("/login", authController.login);
userRoute.post("/signup", authController.signup);
userRoute.post("/verify-otp", authController.verifyOTP);
userRoute.post(
  "/verify-email-resetPassword",
  authController.verifyMailResetPassword
);
userRoute.post(
  "/verify-otp-resetpassword",
  authController.verifyOtpResetPassword
);
userRoute.post("/reset-password", authController.resetPassword);
userRoute.post("/resend-otp",authController.resendOTP)
userRoute.post("/password-resend-otp",authController.passawordResendOTP)

userRoute.get("/auth/google", authController.googleLogin);

userRoute.patch("/update-user-helo_id", updateUserid )

export default userRoute;
