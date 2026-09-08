import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "@/modules/user/user.model";
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
        let user = await User.findOne({ email: profile.emails?.[0].value });

        if (!user) {
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails?.[0].value,
            avatar: profile.photos?.[0].value,
            password: null,
          });
        }

        return done(null, user as any);
      } catch (err) {
        done(err);
      }
    },
  ),
);

passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (_id: string, done) => {
  try {
    const user = await User.findById(_id);
    done(null, user as any);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
