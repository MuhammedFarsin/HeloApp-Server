import { Request, Response } from "express";
import User from "../Model/userModel";
import bcrypt from "bcrypt";
import transporter from "../Config/config";
import jwt from "jsonwebtoken";
import { oauth2Client } from "../Config/googleAuth";
import axios from "axios";
import {
  OtpStoreEntry,
  ResetPasswordOtpEntry,
} from "../Interface/otpInterface";
import { IUser } from "../Interface/IUser";

// Token for Access
const jwtAccessToken = process.env.JWT_TOKEN_SECRET as string;
// OTP GENERATOR
const generateOTP = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString();
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
      subject: "Account Verification CodeNumber",
      html: `<h3><span style='color: #23a925;'>HELO APP</span></h3>
             <h5>Account Verification CodeNumber 📩</h5>
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

    if (!username || !email || !phone || !password) {
      res
        .status(400)
        .json({ message: "Username, email, phone, and password are required" });
      return;
    }
    const duplicateUser = await User.findOne({ email });
    if (duplicateUser) {
      res.status(409).json({ message: "User already exists" });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
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
    // console.log(newUser)
    const otp = generateOTP();
    otpStore[email] = {
      otp,
      expiresIn: Date.now() + 10 * 60 * 1000,
      tempUser: newUser.toObject(),
    };
    await sendMail(email, otp);
    res.status(200).json({
      message: "Signup successful, please verify your email",
      tempUser: newUser.toObject(),
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
    if (!storedOTP || storedOTP.expiresIn < Date.now()) {
      res.status(400).json({ message: "OTP expired or not found" });
      return;
    }

    if (storedOTP.otp === otp) {
      console.log(storedOTP.otp === otp)
      const newUser = new User(storedOTP.tempUser);
      await newUser.save();

      delete otpStore[email];

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

    const user = await User.findOne({
      username: { $regex: new RegExp(`^${username}$`, "i") }  // case-insensitive match
    });

    if (!user || !user.password) {
      res.status(404).json({ message: "User not found...!" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid password...!" });
      return;
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username, email: user.email },
      jwtAccessToken,
      {
        expiresIn: "1h",
      }
    );

    res.status(200).json({
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
      res.status(404).json({ message: "User's email not found...!" });
      return;
    }

    const otp = generateOTP();
    const expiresIn = Date.now() + 10 * 60 * 1000;

    resetPasswordOtpStore[email] = { otp, expiresIn };
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
      res.status(404).json({ message: "OTP is incorrect...!" });
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
const resetPassword = async (req: Request, res: Response): Promise<any> => {
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

//GOOGLE LOGIN
const googleLogin = async (req: Request, res: Response) : Promise <any> => {
  try {
    const { code } = req.query as { code: string };

    const googleRes = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(googleRes.tokens);

    const userRes = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
    );

    const {
      email,
      given_name: firstName,
      family_name: lastName,
      picture: profilePicture,
    } = userRes.data;
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        firstName,
        lastName,
        email,
        profilePicture,
        displayName: `${firstName} ${lastName}`,
      });

      await user.save();
    }

    const token = jwt.sign(
      { _id: user._id, email: user.email, isAdmin: user.isAdmin },
      jwtAccessToken,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      message: user
        ? "User logged in successfully"
        : "User created and logged in successfully",
      token,
      user,
    });
  } catch (error) {
    console.log(error, "Error during Google login");
    return res.status(500).json({ message: "Server error" });
  }
};
const resendOTP = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email } = req.body;

    const storedEntry = otpStore[email];
    if (!storedEntry) {
      return res.status(404).json({ message: "User details not found." });
    }

    const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresIn = Date.now() + 300000; 

    otpStore[email] = {
      otp: newOtp,
      expiresIn: expiresIn,
      tempUser: storedEntry.tempUser,
    };

    await sendMail(email, newOtp);

    return res.status(200).json({ message: "OTP sent successfully." });
  } catch (error: any) {
    console.error("Error resending OTP:", error.message);
    return res.status(500).json({ message: "Internal Server error." });
  }
}
const passawordResendOTP = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email }: { email: string } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found...!" });
    }

    const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresIn = Date.now() + 300000; 
    resetPasswordOtpStore[email] = { otp: newOtp, expiresIn };
    await sendMail(email, newOtp);
    return res.status(200).json({ message: "OTP sent successfully" });

  } catch (error : any) {
    console.error("Error resending OTP:", error.message);
    return res.status(500).json({ message: "Internal Server error...!" });
  }
};

export {
  signup,
  verifyOTP,
  login,
  verifyMailResetPassword,
  verifyOtpResetPassword,
  resetPassword,
  googleLogin,
  resendOTP,
  passawordResendOTP
};
