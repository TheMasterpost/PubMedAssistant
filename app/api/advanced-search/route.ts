import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Get the project root directory
    const projectRoot = process.cwd();

    // Execute the Python script with the query
    const { stdout, stderr } = await execAsync(
      `python test/test_search_metapub.py --query "${query}"`,
      {
        cwd: projectRoot,
        env: { ...process.env, PYTHONUNBUFFERED: '1' }
      }
    );

    // Combine stdout and stderr for the response
    // Some Python scripts might write to stderr for logging without it being an error
    const output = stdout || stderr;

    if (!output && stderr) {
      console.error('Python script error:', stderr);
      return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }

    return NextResponse.json({ result: output });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 });
  }
} 