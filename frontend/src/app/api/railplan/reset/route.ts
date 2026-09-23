import { NextResponse } from "next/server";
import { resetServerState } from "@/lib/serverStore";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const state = resetServerState();
    return NextResponse.json({
      success: true,
      version: state.stateVersion,
      state,
    });
  } catch (error: any) {
    console.error("Error in /api/railplan/reset POST:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
