import Router from "express";
import { upload } from "../config/multer";
import {
    renderFiles,
    uploadFiles,
    renameFile,
    deleteFile,
} from "../controllers/filesController";

const filesRouter = Router();

filesRouter.get("/", renderFiles);
filesRouter.post("/upload", upload.single("uploaded_file"), uploadFiles);
filesRouter.post("/:id/rename", renameFile);
filesRouter.post("/:id/delete", deleteFile);

export default filesRouter;
