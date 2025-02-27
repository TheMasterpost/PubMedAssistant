import { NextResponse } from "next/server"
import { prisma } from "@/app/lib/prisma"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email" },
        { status: 404 }
      )
    }

    // TODO: Implement email sending logic here
    // For now, we'll just return a success message
    return NextResponse.json({
      success: true,
      message: "If an account exists, you will receive an email with login instructions"
    })
  } catch (error) {
    console.error("Email login error:", error)
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    )
  }
} 