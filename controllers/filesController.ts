import type { Request, Response, NextFunction } from "express";
import { isConnected } from "./indexController";
import { prisma } from "../lib/prisma";

export async function renderFiles(req: Request, res: Response) {
    let user;
    if (req.user) {
        user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: { uploads: true },
        });
        console.log("🚀 ~ renderFiles ~ user:", user);
    }
    res.render("files.ejs", {
        isConnected: isConnected(req),
        files: user.uploads ?? [],
    });
}

export async function uploadFiles(req: Request, res: Response) {
    if (!req.file) return;
    if (!req.user) return;

    const newFile = await prisma.file.create({
        data: {
            name: req.file.originalname,
            size: req.file.size,
            path: req.body.user_route,
            link: "TBD",
            userId: req.user.id,
        },
    });

    res.redirect(req.body.user_route);
}
