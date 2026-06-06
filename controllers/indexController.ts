import { body, validationResult, matchedData } from "express-validator";
import bcrypt from "bcrypt";
import passport from "../config/passport.js";
import type { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import "../types/express/index.d";

// VALIDATION
const alphaMessage = " must only use letters.";
const lengthMessage128 = " must be between 1 and 128 characters.";
const lengthMessage100 = " must be between 1 and 100 characters.";

const validateUserSignup = [
    body("email")
        .trim()
        .toLowerCase()
        .isEmail()
        .withMessage("Please provide a valid email address")
        .bail()
        .custom(async (value) => {
            const email = await prisma.user.findFirst({
                where: { email: value },
            });
            if (email) {
                throw new Error("An account already exists with this email.");
            }
            return true;
        }),
    body("username")
        .trim()
        .toLowerCase()
        .isAlpha()
        .withMessage("Username" + alphaMessage)
        .isLength({ min: 1, max: 128 })
        .withMessage("Username" + lengthMessage128)
        .custom(async (value) => {
            const user = await prisma.user.findFirst({
                where: { name: value },
            });
            if (user) {
                throw new Error(
                    "Username already exists. Please choose a different username.",
                );
            }
            return true;
        }),
    body("password")
        .isLength({ min: 1, max: 100 })
        .withMessage("Password" + lengthMessage100),
];

function validateInput(req: Request, res: Response, view: string) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).render(view, {
            errors: errors.array(),
        });
    }

    return matchedData(req);
}

/*
CONTROLLER FUNCTIONS
*/

// Pass req to this function to determine if a user is connected
function isConnected(req: Request) {
    if (req.user) {
        return true;
    }
    return false;
}

export function renderHome(req: Request, res: Response) {
    res.render("index.ejs", {
        isConnected: isConnected(req),
    });
}

export function renderSignUpForm(req: Request, res: Response) {
    res.render("signup.ejs", {
        isConnected: isConnected(req),
    });
}

export const createUser = [
    validateUserSignup,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const formData = validateInput(req, res, "signup.ejs");
            if (formData) {
                const hashedPassword = await bcrypt.hash(formData.password, 10);
                await prisma.user.create({
                    data: {
                        email: formData.email,
                        name: formData.username,
                        password: hashedPassword,
                    },
                });
                res.redirect("/");
            }
        } catch (err) {
            console.error(err);
            next(err);
        }
    },
];

export function renderLoginForm(req: Request, res: Response) {
    // Error handling through the session
    const errorMsg = req.session.errorMessage;
    delete req.session.errorMessage; // Clear message in case user refreshes page
    const formattedErrors = errorMsg ? [{ msg: errorMsg }] : []; // Format error for ejs

    res.render("login.ejs", {
        isConnected: isConnected(req),
        errors: formattedErrors,
    });
}

interface LocalStrategyInfo {
    message: string;
}

export function loginUser(req: Request, res: Response, next: NextFunction) {
    passport.authenticate(
        "local",
        (err: Error, user: Express.User, info: LocalStrategyInfo) => {
            if (err) return next(err);

            if (!user) {
                req.session.errorMessage = info.message; // Store the error in the session
                return res.redirect("/login");
            }

            req.logIn(user, (err) => {
                if (err) return next(err);
                return res.redirect("/");
            });
        },
    )(req, res, next); // Strange usage, but required for authenticate to be executed
}

export function logoutUser(req: Request, res: Response, next: NextFunction) {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect("/");
    });
}
