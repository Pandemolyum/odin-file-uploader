import "express-session";
import "passport";
import * as express from "express";

declare module "express-session" {
    interface SessionData {
        errorMessage: string;
    }
}

declare global {
    namespace Express {
        interface User {
            id: number; // or number, depending on your database
        }
    }
}
