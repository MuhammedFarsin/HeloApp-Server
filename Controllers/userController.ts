import { Request, Response, NextFunction } from "express";
import User from "../Model/userModel";
import bcrypt from "bcrypt";
import transporter from "../Config/config";
import jwt from "jsonwebtoken";
import passport from "passport";
import {
  OtpStoreEntry,
  ResetPasswordOtpEntry,
} from "../Interface/otpInterface";

import { IUser } from "../Interface/IUser"

// Token for Access
const jwtAccessToken = process.env.JWT_TOKEN_SECRET as string;


// OTP GENERATOR
const generateOTP = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit OTP
};

// OTP Stores
const otpStore: { [key: string]: OtpStoreEntry } = {};
const resetPasswordOtpStore: { [key: string]: ResetPasswordOtpEntry } = {};

// SENDING MAIL
const sendMail = async (email: string, otp: string): Promise<void> => {
  try {
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Account Verification Code",
      html: `<h3><span style='color: #23a925;'>HELO APP</span></h3>
             <h5>Account Verification Code 📩</h5>
             <h1>${otp}</h1>`,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Error from NodeMailer:", (error as Error).message);
    throw new Error("Failed to send email");
  }
};

// SIGNUP PROCESS
const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      username,
      email,
      phone,
      password,
      firstName,
      lastName,
      bio,
      profilePicture,
      displayName,
      googleId,
    }: IUser = req.body;

    // Ensure required fields are present
    if (!username || !email || !phone || !password) {
      res.status(400).json({ message: "Username, email, phone, and password are required" });
      return;
    }

    // Check if the user already exists
    const duplicateUser = await User.findOne({ email });
    if (duplicateUser) {
      res.status(409).json({ message: "User already exists" });
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user object using the User model to ensure Mongoose properties are included
    const newUser = new User({
      username,
      email,
      phone,
      password: hashedPassword,
      firstName: firstName || "",
      lastName: lastName || "",
      bio: bio || "",
      profilePicture: profilePicture || "",
      displayName: displayName || "",
      googleId: googleId || "",
      isAdmin: false,
      isBlocked: false,
    });

    // Generate OTP and store in the otpStore with a 10-minute expiry
    const otp = generateOTP();
    otpStore[email] = {
      otp,
      expiresIn: Date.now() + 10 * 60 * 1000,
      tempUser: newUser.toObject(), // Store the user object as a plain object for OTP verification
    };

    // Send OTP to the user's email
    await sendMail(email, otp);

    // Respond with success
    res.status(200).json({
      message: "Signup successful, please verify your email",
      tempUser: newUser.toObject(), // Send a plain object back to the client
    });
  } catch (error) {
    console.error("Error during signup:", (error as Error).message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Verify OTP function
const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      res.status(400).json({ message: "Email and OTP are required" });
      return;
    }

    const storedOTP = otpStore[email];

    // Check if OTP is found and still valid
    if (!storedOTP || storedOTP.expiresIn < Date.now()) {
      res.status(400).json({ message: "OTP expired or not found" });
      return;
    }

    // Compare the provided OTP with the stored one
    if (storedOTP.otp === otp) {
      // Register the user and save to the database
      const newUser = new User(storedOTP.tempUser); // Use tempUser from storedOTP
      await newUser.save();

      // Remove OTP from the store after successful verification
      delete otpStore[email];

      // Respond with success
      res.status(201).json({ message: "User registered successfully" });
    } else {
      res.status(400).json({ message: "Invalid OTP" });
    }
  } catch (error) {
    console.error("Error during OTP verification:", (error as Error).message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// LOGIN
const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ message: "Username and password are required" });
      return;
    }

    const user = await User.findOne({ username });

    if (!user || !user.password) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid password" });
      return;
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username, email: user.email },
      jwtAccessToken,
      {
        expiresIn: "1h",
      }
    );

    res
      .status(200)
      .json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          phone: user.phone,
        },
      });
  } catch (error) {
    console.error("Error during login:", (error as Error).message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// VERIFY EMAIL FOR RESET PASSWORD
const verifyMailResetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "User's email not found" });
      return;
    }

    const otp = generateOTP();
    const expiresIn = Date.now() + 10 * 60 * 1000; // OTP will expire in 10 minutes

    resetPasswordOtpStore[email] = { otp, expiresIn }; // Include both otp and expiresIn

    await sendMail(email, otp);
    res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error(
      "Error during password reset verification:",
      (error as Error).message
    );
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// VERIFY OTP FOR RESET PASSWORD
const verifyOtpResetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { otp } = req.body;
    const storedOtpDetails = Object.entries(resetPasswordOtpStore).find(
      ([_, data]) => data.otp === otp
    );

    if (!storedOtpDetails) {
      res.status(404).json({ message: "OTP not found or expired" });
      return;
    }

    const [email] = storedOtpDetails;
    res.status(200).json({ message: "OTP verified successfully", email });
  } catch (error) {
    console.error(
      "Error during OTP verification for password reset:",
      (error as Error).message
    );
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// RESET PASSWORD
const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { newpassword } = req.body;
    const storedOtpDetails = Object.entries(resetPasswordOtpStore).find(
      ([email]) => email
    );

    if (!storedOtpDetails) {
      res.status(404).json({ message: "Email not found" });
      return;
    }

    const [email] = storedOtpDetails;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    user.password = await bcrypt.hash(newpassword, 10);
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error during password reset:", (error as Error).message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// GOOGLE SIGNIN
// const googleSignIn = (req : Request, res : Response) => {
//   passport.authenticate("google", { scope: ["profile", "email"] })(req, res);
// };

// // Google OAuth callback
// const googleCallback = (req : Request, res : Response) => {
//   passport.authenticate("google", (err : any, user : any) => {
//     if (err || !user) {
//       return res.status(401).send("Authentication failed.");
//     }

//     const token = user.token; // The token from the authentication callback
//     res.json({ token, user: user.user }); // Send token and user data
//   })(req, res);
// };


export {
  signup,
  verifyOTP,
  login,
  verifyMailResetPassword,
  verifyOtpResetPassword,
  resetPassword,
};
