import type { Request, Response, NextFunction } from "express";
import { isConnected } from "./indexController";
import { prisma } from "../lib/prisma";

export async function renderFiles(req: Request, res: Response) {
    try {
        let user = null;
        if (req.user) {
            user = await prisma.user.findUnique({
                where: { id: req.user.id },
                include: { uploads: true },
            });
        }
        res.render("files.ejs", {
            isConnected: isConnected(req),
            files: user?.uploads ?? [],
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
        await prisma.file.create({
            data: {
                name: req.file.originalname,
                size: req.file.size,
                path: req.body.user_route,
                link: "TBD",
                userId: req.user.id,
            },
        });

        res.redirect(req.body.user_route);
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).send("Failed to save file record.");
    }
}

export async function renameFile(req: Request, res: Response) {
    try {
        await prisma.file.update({
            where: { id: Number(req.params.id) },
            data: { name: req.body.newName },
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
    try {
        await prisma.file.delete({
            where: { id: Number(req.params.id) },
        });

        const backUrl = req.header("Referer") || "/";
        res.redirect(backUrl);
    } catch (error) {
        console.error("Delete error:", error);
        res.status(500).send("Could not delete file.");
    }
}
