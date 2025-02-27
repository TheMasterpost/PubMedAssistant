import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from 'fs';

const execAsync = promisify(exec);

export async function POST(request: Request) {
  try {
    const { query, feature } = await request.json();
    
    if (!query) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    let command = "";
    if (feature === 'download') {
      command = `python test/test_search_metapub.py --query "${query}" --return_pmid`;
    } else {
      command = `python test/test_search_metapub.py --query "${query}"`;
    }

    const { stdout, stderr } = await execAsync(command);

    if (stderr && !stderr.includes('INFO:')) {
      console.error('Search error:', stderr);
      return NextResponse.json(
        { error: "Failed to execute search" },
        { status: 500 }
      );
    }

    // For download feature, extract PMID from the result
    if (feature === 'download') {
      const pmidMatch = stdout.match(/PMID:\s*(\d+)/);
      if (pmidMatch && pmidMatch[1]) {
        return NextResponse.json({
          result: "PMID found, initiating download...",
          pmid: pmidMatch[1]
        });
      }
      return NextResponse.json({
        error: "No PMID found in search results",
        noResults: true
      });
    }

    return NextResponse.json({
      result: stdout,
      noResults: stdout.includes("No results found")
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
} 