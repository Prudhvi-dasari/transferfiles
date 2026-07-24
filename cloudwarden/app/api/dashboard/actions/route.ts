import { NextResponse } from "next/server";
import { actions } from "@/lib/mock-data";

export async function GET() {
  const totalSavings = actions
    .filter((a) => a.status === "completed")
    .reduce((sum, a) => sum + a.savingsPerMonth, 0);

  const autoExecuted = actions.filter((a) => a.executedBy === "agent").length;
  const manual = actions.filter((a) => a.executedBy === "manual").length;

  return NextResponse.json({
    actions,
    total: actions.length,
    totalSavings,
    autoExecuted,
    manual,
  });
}
