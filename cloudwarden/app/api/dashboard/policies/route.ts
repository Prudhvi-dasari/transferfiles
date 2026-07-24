import { NextResponse } from "next/server";
import { policies } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json({
    policies,
    total: policies.length,
    active: policies.filter((p) => p.status === "active").length,
  });
}
