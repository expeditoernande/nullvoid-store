import { NextResponse } from "next/server";
import { databaseConfigured, pingDatabase, storageKind } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const ping = await pingDatabase();
  return NextResponse.json({
    ok: true,
    storage: storageKind(),
    postgresConfigured: databaseConfigured(),
    postgres: ping,
  });
}