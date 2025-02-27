import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from 'fs';
import { writeFile } from 'fs/promises';

const execAsync = promisify(exec);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const targetLang = formData.get('targetLang') as string;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    if (!targetLang) {
      return NextResponse.json(
        { error: "No target language specified" },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads');
    await fs.promises.mkdir(uploadsDir, { recursive: true });

    // Save the file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(uploadsDir, file.name);
    await writeFile(filePath, buffer);

    // Execute translation script
    const scriptPath = path.join(process.cwd(), 'test', 'test_translate.py');
    const command = `python ${scriptPath} --file "${filePath}" --target_lang "${targetLang}"`;

    const { stdout, stderr } = await execAsync(command);

    console.log('Command executed:', command);
    console.log('Standard Output:', stdout);
    console.log('Standard Error:', stderr);

    if (stderr && !stderr.includes('INFO:')) {
      console.error('Translation error:', stderr);
      return NextResponse.json(
        { error: "Failed to translate file" },
        { status: 500 }
      );
    }

    // Clean up the uploaded file
    await fs.promises.unlink(filePath);

    return NextResponse.json({
      success: true,
      result: stdout
    });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: "Failed to process translation request" },
      { status: 500 }
    );
  }
} 