import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

// Configuration
cloudinary.config(`${process.env.CLOUDINARY_URL}`);

// Upload a stream
export const uploadToCloud = (
    fileBuffer: Buffer,
    filename: string,
    folder: string,
): Promise<UploadApiResponse> => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                resource_type: "auto",
                public_id: filename,
                overwrite: false,
                folder: folder,
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result as UploadApiResponse);
            },
        );
        stream.end(fileBuffer);
    });
};
