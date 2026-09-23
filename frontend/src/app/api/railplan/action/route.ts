import { NextRequest, NextResponse } from "next/server";
import { executeServerAction } from "@/lib/serverStore";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { actionType, payload, actor } = body;

    if (!actionType) {
      return NextResponse.json(
        { error: "actionType is required" },
        { status: 400 }
      );
    }

    const { success, state, result } = executeServerAction(
      actionType,
      payload,
      actor
    );

    return NextResponse.json({
      success,
      version: state.stateVersion,
      state,
      result,
    });
  } catch (error: any) {
    console.error("Error in /api/railplan/action POST:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
