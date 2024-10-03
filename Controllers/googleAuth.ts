import jwt from "jsonwebtoken";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../Model/userModel";
import dotenv from "dotenv";
import passport from "passport";
import bcrypt from "bcrypt";

dotenv.config();

const jwtAccessToken = process.env.JWT_TOKEN_SECRET as string;

console.log(jwtAccessToken)

// GENERATE RANDOM PASSWORD
const generateRandomPassword = (length: number) => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return password;
};

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIEND_ID!,
      clientSecret: process.env.GOOGLE_CLIEND_ID_SECRET!,
      callbackURL: `/auth/google/callback`,
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : undefined;
        const profilePicture = profile.photos && profile.photos[0] ? profile.photos[0].value : undefined;
        if (!email) {
          return done(new Error("No email found in Google profile"), false);
        }
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          const randomPassword = generateRandomPassword(12); 
          const hashedPassword = await bcrypt.hash(randomPassword, 10);

          user = await User.create({
            googleId: profile.id,
            displayName: profile.displayName,
            email,
            profilePicture,
            password: hashedPassword,
          });
        }

        const token = jwt.sign(
          { id: user._id, email: user.email },
          jwtAccessToken,
          { expiresIn: '1h' }
        );
        
        return done(null, { user, token });
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user);
});

passport.deserializeUser((user: any, done) => {
  done(null, user || false);
});

export default passport;
