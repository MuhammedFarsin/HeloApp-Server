import { Request, Response } from "express";
import User from "../Model/userModel";

export const getUsers = async (req: Request, res: Response): Promise<any> => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUserStatus = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { userId } = req.params;
    const { status } = req.body;
    const user = await User.findByIdAndUpdate(
      userId,
      { status },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
