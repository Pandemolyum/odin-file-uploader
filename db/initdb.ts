import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";

async function main() {
    // Create a new user with a folder and two files
    const user = await prisma.user.create({
        data: {
            name: "admin",
            email: "admin@provider.com",
            password: await bcrypt.hash("admin", 10),
            role: "ADMIN",
            folders: {
                create: {
                    name: "folder",
                    path: "/",
                },
            },
            uploads: {
                create: [
                    {
                        name: "hi.txt",
                        size: 64,
                        path: "/",
                        link: "TBD",
                    },
                    {
                        name: "bye.txt",
                        size: 1111,
                        path: "/folder",
                        link: "TBD",
                    },
                ],
            },
        },
    });
    console.log("Created user:", user);

    // Fetch all users with their files
    const allUsers = await prisma.user.findMany({
        include: {
            uploads: true,
        },
    });
    console.log("All users:", JSON.stringify(allUsers, null, 2));
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
