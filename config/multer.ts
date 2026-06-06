import multer from "multer";

const storage = multer.memoryStorage();
const intSize = 2 ** 31 - 1;

export const upload = multer({
    storage: storage,
    limits: { fileSize: intSize },
});
