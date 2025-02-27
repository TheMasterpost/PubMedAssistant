import { NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"
import path from "path"
import fs from 'fs'

const execAsync = promisify(exec)

export async function POST(request: Request) {
  try {
    const { pmid } = await request.json()

    if (!pmid) {
      return NextResponse.json(
        { error: "PMID is required" },
        { status: 400 }
      )
    }

    // Ensure the download directory exists
    const downloadDir = path.join(process.cwd(), 'public', 'download')
    await fs.promises.mkdir(downloadDir, { recursive: true })

    // Check if file already exists
    const pdfPath = path.join(downloadDir, `${pmid}.pdf`)
    if (fs.existsSync(pdfPath)) {
      console.log('PDF already exists:', pdfPath)
      return NextResponse.json({
        success: true,
        message: "PDF already downloaded",
        downloadPath: `/download/${pmid}.pdf`
      })
    }

    console.log('Starting download for PMID:', pmid)
    const scriptPath = path.join(process.cwd(), 'test', 'test_download_metapub.py')
    const command = `python ${scriptPath} --pmid "${pmid}"`
    
    console.log('Executing command:', command)
    const { stdout, stderr } = await execAsync(command)
    console.log('stdout:', stdout)
    console.log('stderr:', stderr)

    // Check if the file exists after download
    if (fs.existsSync(pdfPath)) {
      console.log('PDF downloaded successfully:', pdfPath)
      return NextResponse.json({
        success: true,
        message: "PDF download completed ",
        downloadPath: `/download/${pmid}.pdf`
      })
    } else {
      console.error('PDF file not found after download attempt')
      return NextResponse.json(
        { error: "PDF file not found after download" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: "Failed to process download request" },
      { status: 500 }
    )
  }
} 