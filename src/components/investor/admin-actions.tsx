"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export function RequestActions({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"approve" | "deny" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function act(action: "approve" | "deny") {
    if (action === "deny" && !confirm("Deny this access request?")) return;
    setBusy(action);
    setError(null);
    try {
      const res = await fetch(`/api/investor/admin/requests/${requestId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Failed.");
        setBusy(null);
        return;
      }
      router.refresh();
    } catch {
      setError("Failed.");
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        <Button
          size="sm"
          className="bg-teal-700 hover:bg-teal-800"
          onClick={() => act("approve")}
          disabled={busy !== null}
        >
          {busy === "approve" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          <span className="ml-1">Approve</span>
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-stone-300 text-stone-700"
          onClick={() => act("deny")}
          disabled={busy !== null}
        >
          <X className="h-4 w-4" />
          <span className="ml-1">Deny</span>
        </Button>
      </div>
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </div>
  );
}

export function InvestorActions({
  userId,
  revoked,
}: {
  userId: string;
  revoked: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function act() {
    const action = revoked ? "restore" : "revoke";
    if (!revoked && !confirm("Revoke this investor's access?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/investor/admin/investors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      });
      if (res.ok) router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className={revoked ? "border-teal-300 text-teal-700" : "border-red-200 text-red-700"}
      onClick={act}
      disabled={busy}
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : revoked ? "Restore" : "Revoke"}
    </Button>
  );
}
