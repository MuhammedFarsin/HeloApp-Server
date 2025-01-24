// import { Request, Response, NextFunction } from "express";
// import User from "../Model/userModel"; // Adjust the path to your User model

// const checkUserStatus = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     const userId = req.user?.userId; // Assuming the JWT payload contains userId
//     const user = await User.findById(userId);

//     if (!user) {
//       res.status(404).json({ message: "User not found" });
//       return;
//     }

//     // Check if the user is blocked
//     if (user.status === "BLOCKED") {
//       res.status(403).json({ message: "Your account has been blocked. Please contact support." });
//       return;
//     }

//     next(); // Proceed if the user is not blocked
//   } catch (error) {
//     console.error("Error checking user status:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

// export default checkUserStatus;