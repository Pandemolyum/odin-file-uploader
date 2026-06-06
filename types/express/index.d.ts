import "express-session";
import "passport";

declare module "express-session" {
    interface SessionData {
        errorMessage: string;
    }
}
