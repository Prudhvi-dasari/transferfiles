import { NextRequest, NextResponse } from "next/server";
import { cloudResources } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const provider = searchParams.get("provider");
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  let filtered = [...cloudResources];

  if (provider && provider !== "all") {
    filtered = filtered.filter((r) => r.provider === provider);
  }
  if (status && status !== "all") {
    filtered = filtered.filter((r) => r.status === status);
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
    );
  }

  return NextResponse.json({ resources: filtered, total: filtered.length });
}
