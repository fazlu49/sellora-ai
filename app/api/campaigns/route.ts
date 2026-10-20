import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const db = readDb();
  if (id) {
    db.campaigns = db.campaigns.filter((c) => c.id !== id);
    writeDb(db);
  }
  return NextResponse.json({ ok: true, campaigns: db.campaigns });
}
