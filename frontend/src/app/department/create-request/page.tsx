"use client";

import React, { Suspense } from "react";
import { CreateRequestForm } from "@/components/requests/CreateRequestForm";

export default function CreateRequestPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<div className="bg-[#000D18] border-2 border-black p-8 text-white font-mono">Loading form parameters...</div>}>
        <CreateRequestForm />
      </Suspense>
    </div>
  );
}
