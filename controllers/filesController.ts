import type { Request, Response } from "express";
import { isConnected } from "./indexController";
import { prisma } from "../lib/prisma";
import { uploadToCloud } from "../config/cloudinary";
import { v2 as cloudinary } from "cloudinary";

export async function renderFiles(req: Request, res: Response) {
    try {
        let user = null;
        if (req.user) {
            user = await prisma.user.findUnique({
                where: { id: req.user.id },
                include: {
                    uploads: true,
                    folders: true,
                },
            });
        }
        res.render("files.ejs", {
            isConnected: isConnected(req),
            files: user?.uploads ?? [],
            folders: user?.folders ?? [],
        });
    } catch (error) {
        console.error("Error rendering files:", error);
        res.status(500).send("Internal Server Error");
    }
}

export async function uploadFiles(req: Request, res: Response) {
    if (!req.file) return res.status(400).send("No file uploaded.");
    if (!req.user)
        return res.status(401).send("Please login before uploading.");

    try {
        let urlPath = req.body.user_route;
        urlPath = urlPath.endsWith("/") ? urlPath.slice(0, -1) : urlPath; // Removes trailing slashes
        const folder = `${req.user.id}${urlPath}`;

        // Create file in cloud
        const cloudResult = await uploadToCloud(
            req.file.buffer,
            req.file.originalname,
            folder,
        );

        // Create file in database
        await prisma.file.create({
            data: {
                name: req.file.originalname,
                size: req.file.size,
                path: urlPath,
                link: cloudResult.secure_url,
                userId: req.user.id,
            },
        });

        res.redirect(urlPath);
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).send("Failed to save file record.");
    }
}

export async function renameFile(req: Request, res: Response) {
    if (!req.user)
        return res.status(401).send("Please login before renaming a file.");

    try {
        const newName = req.body.newName;
        const fileId = Number(req.params.id);

        // Rename file in cloud
        const oldFile = await prisma.file.findUnique({ where: { id: fileId } });
        if (!oldFile) throw new Error("Could not find the file in database.");
        const oldPublicId = `${oldFile?.userId}${oldFile.path}/${oldFile.name}`;
        const newPublicId = `${oldFile?.userId}${oldFile.path}/${newName}`;
        const cloudFile = await cloudinary.uploader
            .rename(oldPublicId, newPublicId, {
                resource_type: "raw",
                invalidate: true,
            })
            .then((result) => result)
            .catch((error) => console.error(error));

        if (!cloudFile) throw new Error("Could not rename file in the cloud.");

        /* At this point, the public ID is updated but the filename
        // in the cloudinary media library online is not changed. This
        // is fine and we can still upload files with the same name as
        // long as the public ID is different.
        */

        // Rename file in database and update path
        await prisma.file.update({
            where: { id: fileId },
            data: { name: newName, link: cloudFile.secure_url },
        });

        // Redirects to previous page (before POST)
        res.redirect(req.header("Referer") || "/");
    } catch (error) {
        console.error("Rename error:", error);
        // Prisma throws P2025 if the record to update is not found
        res.status(404).send("File not found or could not be renamed.");
    }
}

export async function deleteFile(req: Request, res: Response) {
    if (!req.user)
        return res.status(401).send("Please login before deleting a file.");

    try {
        // Delete file in database
        const fileData = await prisma.file.delete({
            where: { id: Number(req.params.id) },
        });

        // Delete file in cloud
        const cloudPath = `${fileData.userId}${fileData.path}/${fileData.name}`;
        await cloudinary.uploader
            .destroy(cloudPath, { resource_type: "raw" })
            .then((result) => console.log(result))
            .catch((error) => console.error(error));

        // Redirects to previous page (before POST)
        res.redirect(req.header("Referer") || "/");
    } catch (error) {
        console.error("Delete error:", error);
        res.status(500).send("Could not delete file.");
    }
}
