import { Request, Response } from "express";
import User from "../Model/userModel";
import multer from "multer";
import { cloudinary } from "../Config/cloudinaryConfig";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export const getUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const usersInfo = await User.findById(userId);  // Fixed here
    if (!usersInfo) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ usersInfo });
  } catch (error) {
    res.status(500).json({ message: "Server error fetching users" });
  }
};

export const updateUserid = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { userId, heloId } = req.body;
    if (!userId || !heloId) {
      return res
        .status(400)
        .json({ message: "User ID and Helo ID are required" });
    }
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { helo_id: heloId },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User updated successfully", updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Server error updating user" });
  }
};

export const uploadProfilePictureToCloudinary = async (
  file: Express.Multer.File
): Promise<string | null> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "auto" },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          reject("Error uploading image to Cloudinary");
        } else {
          resolve(result?.secure_url || null);
        }
      }
    );

    stream.end(file.buffer);
  });
};

export const updateProfilePicture = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { userId } = req.body;
    const file = req.file;
    if (!userId || !file) {
      return res
        .status(400)
        .json({ message: "User ID and profile picture are required" });
    }

    const profilePictureUrl = await uploadProfilePictureToCloudinary(file);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePicture: profilePictureUrl },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "Profile picture updated successfully", updatedUser });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error updating profile picture", error });
  }
};
export const uploadProfilePicture = upload.single("profilePicture");
