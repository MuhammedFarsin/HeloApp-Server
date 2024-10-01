import express, { Router } from "express";
const userRoute: Router = express.Router();
import userController from "../Controllers/userController";
import passport from "../Controllers/googleAuth";

userRoute.use(passport.initialize());

userRoute.post("/login", userController.login);
userRoute.post("/signup", userController.signup);
userRoute.post("/verify-otp", userController.verifyOTP);
userRoute.post("/verify-email-resetPassword", userController.verifyMailResetPassword);
userRoute.post("/verify-otp-resetpassword", userController.verifyOtpResetPassword);
userRoute.post("/reset-password", userController.resetPassword);

userRoute.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

userRoute.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login", session: false }),
  (req, res) => {
    const { user, token } = req.user as any; 
    if (!user || !token) {
      return res.status(401).json({ message: "Authentication failed" });
    }

    return res.status(200).json({
      message: "Login successful!",
      user,
      token,
    });
  }
);

export default userRoute;
