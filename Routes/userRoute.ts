import express, { Router } from "express";
import session from "express-session";
import * as userController from "../Controllers/userController";
import dotenv from "dotenv";

dotenv.config();

// Create Router
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

userRoute.post("/login", userController.login);
userRoute.post("/signup", userController.signup);
userRoute.post("/verify-otp", userController.verifyOTP);
userRoute.post(
  "/verify-email-resetPassword",
  userController.verifyMailResetPassword
);
userRoute.post(
  "/verify-otp-resetpassword",
  userController.verifyOtpResetPassword
);
userRoute.post("/reset-password", userController.resetPassword);

// Google OAuth Routes
userRoute.get("/auth/google", userController.googleLogin);

export default userRoute;
