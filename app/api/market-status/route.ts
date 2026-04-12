import { NextResponse } from "next/server";

export async function GET() {
  const now = new Date();
  const utcDay = now.getUTCDay();
  const utcHour = now.getUTCHours();
  const utcMinute = now.getUTCMinutes();
  const timeInMinutes = utcHour * 60 + utcMinute;

  const isWeekend = utcDay === 0 || utcDay === 6;
  const isPreMarket = !isWeekend && timeInMinutes >= 600 && timeInMinutes < 855;
  const isMarketOpen = !isWeekend && timeInMinutes >= 855 && timeInMinutes <= 1260;
  const isAfterHours = !isWeekend && timeInMinutes > 1260;

  let mode = "weekend";
  if (isPreMarket) mode = "premarket";
  if (isMarketOpen) mode = "open";
  if (isAfterHours) mode = "afterhours";

  const nextOpen = new Date();
  if (isWeekend) {
    const daysUntilMonday = utcDay === 0 ? 1 : 2;
    nextOpen.setUTCDate(nextOpen.getUTCDate() + daysUntilMonday);
    nextOpen.setUTCHours(13, 30, 0, 0);
  }

  return NextResponse.json({
    mode,
    isWeekend,
    isPreMarket,
    isMarketOpen,
    isAfterHours,
    nextOpen: nextOpen.toISOString(),
    currentTime: now.toISOString(),
  });
}