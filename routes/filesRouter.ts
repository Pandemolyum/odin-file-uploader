import Router from "express";
import multer from "multer";
import { renderFiles, uploadFiles } from "../controllers/filesController";

const filesRouter = Router();
const upload = multer({ dest: "../public/uploads/" });

filesRouter.get("/", renderFiles);
filesRouter.post("/upload", upload.single("uploaded_file"), uploadFiles);

export default filesRouter;
