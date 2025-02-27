import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

export async function POST(request: Request) {
  try {
    const { journal, author1, year, keyword, query } = await request.json();
    
    // Build the command based on provided parameters
    let command = "python test/test_search_metapub.py";
    
    if (query) {
      command += ` --query "${query}"`;
    } else {
      if (journal) command += ` --journal "${journal}"`;
      if (author1) command += ` --author1 "${author1}"`;
      if (year) command += ` --year "${year}"`;
      if (keyword) command += ` --keyword "${keyword}"`;
    }

    const { stdout, stderr } = await execAsync(command);

    // Parse the PMIDs from the output
    const pmidsMatch = stdout.match(/PMIDs.*?: \[(.*?)\]/);
    if (pmidsMatch && pmidsMatch[1]) {
      const pmids = pmidsMatch[1].split(',').map(id => id.trim().replace(/'/g, ''));
      return NextResponse.json({ result: pmids });
    }

    if (stderr && !stderr.includes('INFO:')) {
      console.error('Search error:', stderr);
      return NextResponse.json(
        { error: "Error executing search" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      result: [],
      noResults: true 
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}