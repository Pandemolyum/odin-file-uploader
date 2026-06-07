import Router from "express";
import { upload } from "../config/multer";
import {
    renderFiles,
    uploadFiles,
    renameFile,
    deleteFile,
    renderSharedFiles,
} from "../controllers/filesController";

const filesRouter = Router();

// Shared files display
filesRouter.get("/share/:uuid", renderSharedFiles);
filesRouter.get("/share/:uuid/{*path}", renderSharedFiles);

// POST files operations
filesRouter.post("/upload", upload.single("uploaded_file"), uploadFiles);
filesRouter.post("/:id/rename", renameFile);
filesRouter.post("/:id/delete", deleteFile);

// Files display
filesRouter.get("/{*path}", renderFiles); // RegEx matches everything

export default filesRouter;
