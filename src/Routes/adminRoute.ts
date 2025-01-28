import express, { Router } from "express";
import session from "express-session";
import dotenv from "dotenv";
import { getUsers, updateUserStatus } from "../Controllers/adminUserController";

const adminRoute: Router = express.Router();
dotenv.config();
const sessionSecret = process.env.SESSION_SECRET || "HELOAPP-SECRET";

adminRoute.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 60000 },
  })
);

adminRoute.get("/get-users", getUsers);
adminRoute.put("/update-user-status/:userId", updateUserStatus);

export default adminRoute;