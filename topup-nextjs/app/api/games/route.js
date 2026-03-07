import { NextResponse } from "next/server";
import games from "@/data/games.json";

export async function GET() {
  return NextResponse.json(games);
}