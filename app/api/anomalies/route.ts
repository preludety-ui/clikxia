import { NextRequest, NextResponse } from "next/server";

const ENGINE_URL = process.env.CLIKXIA_ENGINE_URL || "https://clikxia-engine-production.up.railway.app";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const country = searchParams.get("country") || "CA";

  try {
    const res = await fetch(`${ENGINE_URL}/anomalies?country=${country}`, {
      next: { revalidate: 900 }
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Engine unavailable" }, { status: 500 });
  }
}