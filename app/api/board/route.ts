import { NextResponse } from "next/server";
import { getBoard } from "../../../lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const board = await getBoard();
  return NextResponse.json(board);
}
