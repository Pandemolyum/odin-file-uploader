import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export async function createFolder(req: Request, res: Response) {
    if (!req.user)
        return res.status(401).send("Please login before creating a folder.");

    try {
        let urlPath = req.body.user_route;
        const folderName = req.body.folderName;
        urlPath = urlPath.endsWith("/") ? urlPath.slice(0, -1) : urlPath; // Removes trailing slashes

        // Create file in database
        await prisma.folder.create({
            data: {
                name: folderName,
                path: urlPath,
                userId: req.user.id,
            },
        });

        res.redirect(urlPath);
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).send("Failed to create folder record.");
    }
}

export async function renameFolder(req: Request, res: Response) {
    if (!req.user)
        return res.status(401).send("Please login before renaming a folder.");

    try {
        // Get old folder data
        const folderId = Number(req.params.id);
        const oldFolder = await prisma.folder.findUnique({
            where: { id: folderId },
        });
        if (!oldFolder) throw new Error("Could not find folder in database.");

        // Rename folder in database and update path
        await prisma.folder.update({
            where: { id: folderId },
            data: { name: req.body.newName },
        });

        // Redirects to previous page (before POST)
        res.redirect(req.header("Referer") || "/");
    } catch (error) {
        console.error("Rename error:", error);
        // Prisma throws P2025 if the record to update is not found
        res.status(404).send("Folder not found or could not be renamed.");
    }
}

export async function deleteFolder(req: Request, res: Response) {
    if (!req.user)
        return res.status(401).send("Please login before deleting a folder.");

    try {
        // Delete file in database
        const folderData = await prisma.folder.delete({
            where: { id: Number(req.params.id) },
        });

        // Redirects to parent of deleted folder
        res.redirect(folderData.path);
    } catch (error) {
        console.error("Delete error:", error);
        res.status(500).send("Could not delete folder.");
    }
}
