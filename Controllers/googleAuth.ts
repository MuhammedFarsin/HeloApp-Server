// import jwt from "jsonwebtoken";
// import { Strategy as GoogleStrategy } from "passport-google-oauth20";
// import User from "../Model/userModel";
// import dotenv from "dotenv";
// import passport from "passport";
// import bcrypt from "bcrypt";

// dotenv.config();

// const jwtAccessToken = process.env.JWT_TOKEN_SECRET as string;

// // GENERATE RANDOM PASSWORD
// const generateRandomPassword = (length: number) => {
//   const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
//   let password = "";
//   for (let i = 0; i < length; i++) {
//     password += characters.charAt(Math.floor(Math.random() * characters.length));
//   }
//   return password;
// };

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIEND_ID!,
//       clientSecret: process.env.GOOGLE_CLIEND_ID_SECRET!,
//       callbackURL: `/auth/google/callback`,
//       scope: ["profile", "email"],
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         const email = profile.emails && profile.emails[0] ? profile.emails[0].value : undefined;
//         const profilePicture = profile.photos && profile.photos[0] ? profile.photos[0].value : undefined;

//         if (!email) {
//           return done(new Error("No email found in Google profile"), false);
//         }

//         let user = await User.findOne({ googleId: profile.id });
//         if (!user) {
//           const randomPassword = generateRandomPassword(12); 
//           const hashedPassword = await bcrypt.hash(randomPassword, 10);

//           user = await User.create({
//             googleId: profile.id,
//             displayName: profile.displayName,
//             email,
//             profilePicture,
//             password: hashedPassword,
//           });
//         }

//         // Create JWT token for authenticated user
//         const token = jwt.sign(
//           { id: user._id, email: user.email },
//           jwtAccessToken,
//           { expiresIn: '1h' }
//         );

//         console.log('this is the google auth token', token);

//         // Attach token along with user object to pass to done
//         return done(null, { user, token });
//       } catch (error) {
//         return done(error, false);
//       }
//     }
//   )
// );

// passport.serializeUser((user: any, done) => {
//   done(null, user);
// });

// passport.deserializeUser((user: any, done) => {
//   done(null, user || false);
// });
// export default passport;

// authController.js
import { Request, Response } from "express";
import User from '../Model/userModel';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const jwtTokenAuth = process.env.JWT_TOKEN_SECRET as string

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIEND_ID,      // Your Google Client ID
  process.env.GOOGLE_CLIEND_ID_SECRET,  // Your Google Client Secret
  process.env.REDIRECT_URI           // Your Redirect URI
);

// Function to handle Google OAuth
export const googleAuth = async (req : Request, res : Response) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Authorization code is missing' });
    }

    // Exchange authorization code for access token
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info from Google
    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: 'v2',
    });
    const userInfo = await oauth2.userinfo.get();

    // Here you can save or update the user in your database
    // For example:
    const user = await findOrCreateUser(userInfo.data); // Implement this function

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      jwtTokenAuth,
      { expiresIn: '1h' }
    );

    // Send the token and user info to the frontend
    res.json({
      token,
      user,
    });
  } catch (error) {
    console.error('Error during Google authentication:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Helper function to find or create a user in your database
const findOrCreateUser = async (googleUser : any) => {
  // Import your User model

  let user = await User.findOne({ googleId: googleUser.id });

  if (!user) {
    user = new User({
      googleId: googleUser.id,
      email: googleUser.email,
      displayName: googleUser.name,
      profilePicture: googleUser.picture,
    });
    await user.save();
  }

  return user;
};
