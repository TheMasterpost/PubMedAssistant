// app/api/test_metapub/route.ts
import { NextResponse } from "next/server";
import { exec } from "child_process";
import util from "util";

const execPromise = util.promisify(exec);

export async function POST(request: Request) {
    const { pmid } = await request.json();

    try {
        // Execute the Python script with the provided PubMed ID
        const { stdout, stderr } = await execPromise(`python3 test/test_metapub.py ${pmid}`);
        
        if (stderr) {
            throw new Error(stderr);
        }
        
        // Return the output of the script as JSON
        return NextResponse.json({ result: stdout });
    } catch (error) {
        console.error("Error executing script:", error);
        return NextResponse.json({ error: "Failed to fetch article details" }, { status: 500 });
    }
}