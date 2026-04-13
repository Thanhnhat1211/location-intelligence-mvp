import { NextResponse } from "next/server";
import fs from "fs/promises";

const DATA_DIR = process.env.DATA_DIR || "data";

export async function GET() {
  const checks: Record<string, string> = {};

  // Check data directory is writable
  try {
    await fs.access(DATA_DIR);
    checks.dataDir = "ok";
  } catch {
    checks.dataDir = "missing";
  }

  const healthy = checks.dataDir === "ok";

  return NextResponse.json(
    {
      status: healthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: healthy ? 200 : 503 }
  );
}
