import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || 
             req.headers.get("x-real-ip") || 
             "unknown";

  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await res.json();
    
    return NextResponse.json({
      country: data.country_code || "US",
      country_name: data.country_name || "United States",
      currency: data.currency || "USD",
      languages: data.languages || "en",
      timezone: data.timezone || "UTC",
    });
  } catch {
    return NextResponse.json({
      country: "US",
      country_name: "United States", 
      currency: "USD",
      languages: "en",
      timezone: "UTC",
    });
  }
}