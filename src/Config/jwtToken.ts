import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const jwtAccessToken = process.env.JWT_TOKEN_SECRET as string;

interface CustomRequest extends Request {
  user?: string | JwtPayload;
}

const authenticateJWT = (req: CustomRequest, res: Response, next: NextFunction): Response | void => {
  const authHeader = req.headers.authorization;

  // Validate Authorization header format
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization header missing or invalid" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Synchronously verify the token
    const decoded = jwt.verify(token, jwtAccessToken);
    req.user = decoded;
    next(); // Proceed to the next middleware
  } catch (err: any) {
    // Handle token errors explicitly
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    } else if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    // General error
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default authenticateJWT;
