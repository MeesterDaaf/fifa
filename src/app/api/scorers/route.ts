import { NextResponse } from "next/server";
import { getScorers } from "@/lib/football-api";

export async function GET() {
  try {
    const scorers = await getScorers();
    return NextResponse.json(scorers);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
