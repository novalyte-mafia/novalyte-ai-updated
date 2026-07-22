"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { captureSafeEvent } from "@/lib/analytics-client";

const investorTypes = [
  { value: "angel", label: "Angel" },
  { value: "venture_capital", label: "Venture capital" },
  { value: "family_office", label: "Family office" },
  { value: "strategic", label: "Strategic" },
  { value: "healthcare_operator", label: "Healthcare operator" },
  { value: "corporate_venture", label: "Corporate venture" },
  { value: "syndicate", label: "Syndicate" },
  { value: "advisor", label: "Advisor" },
  { value: "other", label: "Other" },
];

export function AccessRequestForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStatus("submitting");
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    captureSafeEvent("investor_contact_started", { form_type: "investor_access" });

    try {
      const res = await fetch("/api/investor/access-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Unable to submit request. Please try again.");
        captureSafeEvent("form_submission_error", { form_type: "investor_access" });
        setStatus("idle");
        return;
      }
      setStatus("success");
      captureSafeEvent("investor_contact_submitted", { form_type: "investor_access" });
      form.reset();
    } catch {
      setError("Something went wrong. Please try again.");
      captureSafeEvent("form_submission_error", { form_type: "investor_access" });
      setStatus("idle");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
        <h3 className="mt-4 text-lg font-semibold text-emerald-900">
          Request received
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-emerald-800">
          Thank you. Your request has been sent to the founder for review. If
          approved, you will receive a secure invitation to the data room by
          email.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="fullName" label="Full name" required>
          <Input id="fullName" name="fullName" required minLength={2} maxLength={120} />
        </Field>
        <Field id="workEmail" label="Work email" required>
          <Input id="workEmail" name="workEmail" type="email" required maxLength={150} />
        </Field>
        <Field id="firm" label="Firm / organization">
          <Input id="firm" name="firm" maxLength={150} />
        </Field>
        <Field id="roleTitle" label="Role / title">
          <Input id="roleTitle" name="roleTitle" maxLength={120} />
        </Field>
        <Field id="investorType" label="Investor type" required>
          <select
            id="investorType"
            name="investorType"
            required
            defaultValue="angel"
            className="flex h-10 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          >
            {investorTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>
        <Field id="checkSizeRange" label="Typical check size">
          <Input id="checkSizeRange" name="checkSizeRange" maxLength={80} placeholder="e.g. $25k–$100k" />
        </Field>
        <Field id="linkedinUrl" label="LinkedIn URL">
          <Input id="linkedinUrl" name="linkedinUrl" type="url" maxLength={300} placeholder="https://" />
        </Field>
        <Field id="website" label="Website">
          <Input id="website" name="website" type="url" maxLength={300} placeholder="https://" />
        </Field>
      </div>

      <div className="mt-5">
        <Field id="reasonForInterest" label="Why are you interested in Novalyte AI?" required>
          <Textarea
            id="reasonForInterest"
            name="reasonForInterest"
            required
            minLength={20}
            maxLength={4000}
            rows={4}
            placeholder="A few sentences on your interest, thesis fit, and how you found us."
          />
        </Field>
      </div>

      <div className="mt-5">
        <Field id="discoverySource" label="How did you hear about us?">
          <Input id="discoverySource" name="discoverySource" maxLength={200} />
        </Field>
      </div>

      {error ? (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        size="lg"
        className="mt-6 w-full bg-teal-700 hover:bg-teal-800 sm:w-auto"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting
          </>
        ) : (
          "Request access"
        )}
      </Button>
      <p className="mt-3 text-xs leading-relaxed text-stone-500">
        Nothing here constitutes an offer to sell or a solicitation to buy
        securities. Access to confidential materials is granted at the founder&apos;s
        discretion.
      </p>
    </form>
  );
}

function Field({
  id,
  label,
  required,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={id} className="text-sm font-medium text-stone-700">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
