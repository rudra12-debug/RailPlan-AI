import { NextRequest, NextResponse } from "next/server";
import { getServerState } from "@/lib/serverStore";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const clientVersion = parseInt(searchParams.get("version") || "0", 10);
    const serverState = getServerState();

    if (clientVersion && clientVersion === serverState.stateVersion) {
      return NextResponse.json({
        changed: false,
        version: serverState.stateVersion,
      });
    }

    return NextResponse.json({
      changed: true,
      version: serverState.stateVersion,
      state: serverState,
    });
  } catch (error: any) {
    console.error("Error in /api/railplan/sync GET:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
