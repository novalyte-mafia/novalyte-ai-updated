"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/site/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Loader2 } from "lucide-react";

export function InvestorGateScreen() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/investor/gate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Invalid access code.");
        setLoading(false);
        return;
      }
      router.replace("/investor");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo />
          <div className="mt-6 flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-teal-700">
            <Lock className="h-5 w-5" aria-hidden />
          </div>
          <h1 className="mt-5 font-serif text-2xl font-semibold text-stone-900">
            Private investor portal
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            This is a confidential Novalyte AI investor workspace. Access is by
            invitation only. Enter your access code to continue.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
        >
          <Label htmlFor="access-code" className="text-sm font-medium text-stone-700">
            Access code
          </Label>
          <Input
            id="access-code"
            name="access-code"
            autoComplete="off"
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter access code"
            className="mt-2"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "access-code-error" : undefined}
          />
          {error ? (
            <p id="access-code-error" className="mt-2 text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}
          <Button
            type="submit"
            className="mt-4 w-full bg-teal-700 hover:bg-teal-800"
            disabled={loading || code.trim().length === 0}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying
              </>
            ) : (
              "Enter portal"
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs leading-relaxed text-stone-500">
          Confidential and proprietary. Nothing on this portal constitutes an offer
          to sell or a solicitation to buy securities. Need access? Contact{" "}
          <a
            href="mailto:founder@novalyte.io"
            className="font-medium text-teal-700 hover:underline"
          >
            founder@novalyte.io
          </a>
          .
        </p>
      </div>
    </div>
  );
}
