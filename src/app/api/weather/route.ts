import { NextResponse } from "next/server";
import { getWeatherContext } from "@/lib/weather";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const district = searchParams.get("district") || "";

  const weather = await getWeatherContext(district);

  return NextResponse.json({
    success: true,
    weather,
  });
}