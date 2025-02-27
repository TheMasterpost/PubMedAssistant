import { NextResponse } from "next/server";
import { OAuth2Client } from 'google-auth-library';
import { prisma } from "@/lib/prisma";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(request: Request) {
    const { id_token } = await request.json();

    try {
        const ticket = await client.verifyIdToken({
            idToken: id_token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            return NextResponse.json({ error: "Invalid token payload" }, { status: 401 });
        }
        const email = payload.email;

        // Check if user exists in the database
        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            // Create a new user if they don't exist
            user = await prisma.user.create({
                data: {
                    name: payload['name'],
                    email,
                    // You can set a default password or handle it differently
                },
            });
        }

        // Return success response
        return NextResponse.json({ success: true, user });
    } catch (error) {
        console.error("Google Sign-In error:", error);
        return NextResponse.json({ error: "Failed to sign in with Google" }, { status: 500 });
    }
}