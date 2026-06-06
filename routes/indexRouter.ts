import Router from "express";
import {
    renderHome,
    renderSignUpForm,
    createUser,
    renderLoginForm,
    loginUser,
    logoutUser,
} from "../controllers/indexController";

const indexRouter = Router();

indexRouter.get("/", renderHome);

indexRouter.get("/signup", renderSignUpForm);
indexRouter.post("/signup", ...createUser);

indexRouter.get("/login", renderLoginForm);
indexRouter.post("/login", loginUser);

indexRouter.get("/logout", logoutUser);

export default indexRouter;
