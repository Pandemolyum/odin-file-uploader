import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";
import type { User } from "../generated/prisma/client";

// Set up LocalStrategy
passport.use(
    new LocalStrategy(async (username, password, done) => {
        const lowerUsername = username.toLowerCase();

        try {
            const user = await prisma.user.findFirst({
                where: {
                    OR: [{ email: lowerUsername }, { name: lowerUsername }],
                },
            });

            if (!user) {
                return done(null, false, { message: "Incorrect username" });
            }

            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                return done(null, false, { message: "Incorrect password" });
            }

            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }),
);

// Contains information to store in the session cookie
passport.serializeUser((user: Express.User, done) => {
    done(null, (user as User).id);
});

// Called when retrieving a session. Extracts serialized data and attaches
// something to req.user for use in the rest of the request
passport.deserializeUser(async (id: number, done) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: id },
        });

        done(null, user);
    } catch (err) {
        done(err);
    }
});

export default passport;
