import express, { Router } from "express";
import session from "express-session";
import * as userController from "../Controllers/userController";
import { googleAuth } from "../Controllers/googleAuth"
// import passport from "../Controllers/googleAuth";
import dotenv from "dotenv";

dotenv.config();

// Create Router
const userRoute: Router = express.Router();
const sessionSecret = process.env.SESSION_SECRET || "HELOAPP-SECRET";

// Initialize express-session
userRoute.use(
  session({
    secret: sessionSecret, // Use a strong secret key
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 60000 }, // Cookie settings (adjust maxAge as per need)
  })
);

// Initialize passport middleware after session
// userRoute.use(passport.initialize());
// userRoute.use(passport.session()); // Enable session support in passport

// Define Routes
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
userRoute.post('/auth/google',googleAuth);


export default userRoute;
