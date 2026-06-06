import Router from "express";
import { upload } from "../config/multer";
import {
    renderFiles,
    uploadFiles,
    renameFile,
    deleteFile,
} from "../controllers/filesController";

const filesRouter = Router();

// Files
filesRouter.post("/upload", upload.single("uploaded_file"), uploadFiles);
filesRouter.post("/:id/rename", renameFile);
filesRouter.post("/:id/delete", deleteFile);

// Display
filesRouter.get("/{*path}", renderFiles); // RegEx matches everything

export default filesRouter;
