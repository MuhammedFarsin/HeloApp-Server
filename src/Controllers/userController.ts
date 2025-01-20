import { Request, Response } from "express";
import User from "../Model/userModel";

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
