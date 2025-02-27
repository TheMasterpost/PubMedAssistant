import { exec } from "child_process"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { query } = await req.json()
    
    return new Promise((resolve, reject) => {
      exec(`python src/main.py --query "${query}"`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error: ${error}`)
          resolve(NextResponse.json({ error: error.message }, { status: 500 }))
          return
        }
        resolve(NextResponse.json({ result: stdout }))
      })
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to process request" }, { status: 400 })
  }
} 