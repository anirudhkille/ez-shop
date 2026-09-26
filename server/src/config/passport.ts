import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import * as userRepository from "@/modules/user/user.repository";
import { env } from "@/config/env.config";

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(
            new Error("Google account did not provide an email"),
            false,
          );
        }

        let user = await userRepository.findByEmail(email);

        if (!user) {
          user = await userRepository.createUser({
            googleId: profile.id,
            name: profile.displayName,
            email,
            avatar: profile.photos?.[0].value,
            password: null,
          });
        }

        return done(null, user as unknown as Express.User);
      } catch (err) {
        done(err);
      }
    },
  ),
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (_id: string, done) => {
  try {
    const user = await userRepository.findById(_id);
    done(null, user as unknown as Express.User);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
