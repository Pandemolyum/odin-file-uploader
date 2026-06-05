import express from "express";
import type { Express } from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import passport from "./config/passport.js";
import session from "express-session";
import { PrismaPg } from "@prisma/adapter-pg"; // For other db adapters, see Prisma docs
import { PrismaClient } from "./generated/prisma/client";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";

// Create the express application
const app: Express = express();

// DATABASE_URL defined in env file included in prisma.config.js; see Prisma docs
const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// Passport and session initialization
app.use(
    session({
        cookie: {
            maxAge: 7 * 24 * 60 * 60 * 1000, // ms
        },
        secret: "a santa at nasa",
        resave: true,
        saveUninitialized: true,
        store: new PrismaSessionStore(prisma, {
            checkPeriod: 2 * 60 * 1000, //ms
            dbRecordIdIsSessionId: true,
        }),
    }),
);

app.use(passport.initialize());
app.use(passport.session());

// Assign project paths
const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = dirname(__filename);

// Set assets path (styles)
const assetsPath: string = path.join(__dirname, "public");
app.use(express.static(assetsPath));

// Set views engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Parses requests that contain URL-encoded data and
// converts them to a JavaScript object accessible via "req.body"
app.use(express.urlencoded({ extended: true }));

// Routes
//TODO

app.listen(process.env.PORT_NODE, () => {
    console.log(`Express app listening on port ${process.env.PORT_NODE}...`);
});
