import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { username, password } = req.body;
    const user = await prisma.user.findUnique({ where: { Email: username } });

    if (!user) {
        return res.status(404).json({ error: 'No such user exists' });
    }

    const userCredential = await prisma.userCredential.findUnique({
        where: {
            Uid_Password: {
                Uid: user.Uid,
                Password: password,
            },
        },
    });

    if (!userCredential) {
        return res.status(400).json({ error: 'Invalid Password' });
    }

    const userRole = await prisma.userRole.findFirst({ where: { Uid: user.Uid } });
    const role = await prisma.role.findUnique({ where: { RoleId: userRole.RoleId } });

    return res.status(200).json({ uname: user.FirstName, role: role.RoleName });
}
