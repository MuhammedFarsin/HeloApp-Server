import { Request, Response } from "express";
import User from "../Model/userModel";
import bcrypt from "bcrypt";
import transporter from "../Config/config";
import { Error } from "mongoose";



//OTP GENERATOR
const generateOTP = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit OTP
};

//CREATE A TEMP STORAGE FOR STORING DATA
const otpStore: {
  [key: string]: {
    otp: string;
    tempUser: {
      username: string;
      email: string;
      phone: number;
      password: string;
    };
  };
} = {};

//SENDING MAIL
const sendMail = async (email: string, otp: string): Promise<any> => {
  try {
    const mailOption = {
      from: process.env.EMAIL,
      to: email,
      subject: "For verification mail",
      html: `<h3><span style='color: #23a925;'>HELO APP</span> </h3>
            <h5>Account Verification Code 📩</h5>
            <h1>${otp}</h1>  `,
    };
    let info = await transporter.sendMail(mailOption);
    console.log("Email has been sent:", info.response);

    return otp;
  } catch (error) {
    console.error("Error from NodeMailer:", (error as Error).message);
    throw new Error("Failed to send email");
  }
};

//SIGNUP PROCESS
const signup = async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      username,
      email,
      phone,
      password,
    }: {
      username: string;
      email: string;
      phone: number;
      password: string;
    } = req.body;

    if (!username || !email || !password || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const duplicateUser = await User.findOne({ email });
    if (duplicateUser) {
      return res.status(409).json({ message: "User already exists...!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const tempUser = { username, email, phone, password: hashedPassword };

    const otp = generateOTP();
    otpStore[email] = { otp, tempUser };
    await sendMail(email, otp);

    return res.status(200).json({
      message: "Signup successful, please verify your email with the OTP sent",
      tempUser,
    });
  } catch (error) {
    console.error("Error during signup:", (error as Error).message);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

//VERIFY OTP
const verifyOTP = async (req: Request, res: Response): Promise<any> => {
  try {
    const { otp, email } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const storedData = otpStore[email];
    if (!storedData || storedData.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP...!",
      });
    }

    const { tempUser } = storedData;
    const newUser = new User(tempUser);
    await newUser.save();

    delete otpStore[email];
    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error during verifyOTP", (error as Error).message);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

//EXPORTING
export = {
  signup,
  verifyOTP,
};
