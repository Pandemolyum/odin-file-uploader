import Router from "express";
import {
    createFolder,
    renameFolder,
    deleteFolder,
    renderShareForm,
    shareFolder,
} from "../controllers/foldersController";

const filesRouter = Router();

filesRouter.post("/create", createFolder);
filesRouter.post("/:id/rename", renameFolder);
filesRouter.post("/:id/delete", deleteFolder);

filesRouter.get("/:id/share", renderShareForm);
filesRouter.post("/:id/share", shareFolder);

export default filesRouter;
