import Router from "express";
import multer from "multer";
import {
    renderFiles,
    uploadFiles,
    renameFile,
} from "../controllers/filesController";

const filesRouter = Router();
const upload = multer({ dest: "../public/uploads/" });

filesRouter.get("/", renderFiles);
filesRouter.post("/upload", upload.single("uploaded_file"), uploadFiles);
filesRouter.post("/:id/rename", renameFile);
filesRouter.post("/:id/delete", renameFile);

export default filesRouter;
