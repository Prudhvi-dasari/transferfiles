import { NextResponse } from "next/server";
import { alerts } from "@/lib/mock-data";

export async function GET() {
  const sorted = [...alerts].sort((a, b) => {
    const severity = { critical: 0, warning: 1, info: 2 };
    return severity[a.severity] - severity[b.severity];
  });

  return NextResponse.json({
    alerts: sorted,
    total: sorted.length,
    unacknowledged: sorted.filter((a) => !a.acknowledged).length,
    critical: sorted.filter((a) => a.severity === "critical").length,
  });
}
