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
        // Typescript all of a sudden not recognizing @types/multer
        // Have to include it here
        interface Request {
            file?: Express.Multer.File;
            files?:
                | {
                      [fieldname: string]: Express.Multer.File[];
                  }
                | Express.Multer.File[];
        }
    }
}
