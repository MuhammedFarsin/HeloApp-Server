import jwt from "jsonwebtoken";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../Model/userModel";
import dotenv from "dotenv";
import passport from "passport";

dotenv.config();

const jwtAccessToken = process.env.JWT_TOKEN_SECRET as string;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIEND_ID!,
      clientSecret: process.env.GOOGLE_CLIEND_ID_SECRET!,
      callbackURL: "http://localhost:8080/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : undefined;

        if (!email) {
          return done(new Error("No email found in Google profile"), false);
        }

        let user = await User.findOne({ googleId: profile.id });

        // Create user if not found
        if (!user) {
          user = await User.create({
            googleId: profile.id,
            displayName: profile.displayName,
            email,
          });
        }

        // Generate JWT token
        const token = jwt.sign(
          { id: user._id, email: user.email },
          jwtAccessToken,  // Use JWT_SECRET from your environment variables
          { expiresIn: '1h' } // Set token expiration
        );

        // Call done with the user and the token
        return done(null, { user, token });
      } catch (error) {
        return done(error, false);
      }
    }
  )
);
export default passport
