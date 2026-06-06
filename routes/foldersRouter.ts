import Router from "express";
import {
    createFolder,
    renameFolder,
    deleteFolder,
} from "../controllers/foldersController";

const filesRouter = Router();

filesRouter.post("/create", createFolder);
filesRouter.post("/:id/rename", renameFolder);
filesRouter.post("/:id/delete", deleteFolder);

export default filesRouter;
