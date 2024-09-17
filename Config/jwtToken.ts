import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const jwtAccessToken = process.env.JWT_TOKEN_SECRET as string;

interface CustomRequest extends Request {
  user?: string | JwtPayload;
}

const authenticateJWT = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = authHeader.split(" ")[1];

      jwt.verify(token, jwtAccessToken, (err, decoded) => {
        if (err) {
          console.log("JWT verification error:", err);
          return res.sendStatus(403); // Invalid token
        }
        req.user = decoded; // Save decoded JWT payload to req.user
        next(); // Proceed if the token is valid
      });
    } else {
      res.sendStatus(401); // No token provided
    }
  } catch (error) {
    console.error("JWT Authentication Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export default authenticateJWT;
