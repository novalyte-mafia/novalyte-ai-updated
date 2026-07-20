"use client";

import { useEffect, useState } from "react";
import { Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { WorkspaceShell } from "@/components/site/workspace-shell";
import { getSupabaseClient } from "@/lib/supabase/client";

export default function VerificationPendingPage() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    getSupabaseClient().auth.getUser().then(({ data }) => {
      if (data.user?.email_confirmed_at) window.location.replace("/workforce/professional");
      else setEmail(data.user?.email ?? window.localStorage.getItem("novalyte-professional-verification-email") ?? "");
    });
  }, []);

  async function resend() {
    if (!email) return;
    setSending(true);
    const { error } = await getSupabaseClient().auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setSending(false);
    if (error) toast.error(error.message);
    else toast.success("A new confirmation email has been sent.");
  }

  return (
    <WorkspaceShell role="professional" navItems={[]} signOutRedirect="/workforce/professional/sign-in">
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <section className="w-full max-w-md rounded-3xl border bg-card p-8 text-center shadow-premium-md">
          <MailCheck className="mx-auto h-12 w-12 text-teal-600" />
          <h1 className="mt-5 text-2xl font-bold">Confirm your email</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            We sent a Novalyte confirmation link to <strong className="text-foreground">{email || "your email"}</strong>.
            Confirm it before starting your professional profile.
          </p>
          <Button className="mt-6 w-full bg-teal-600 text-white hover:bg-teal-700" onClick={resend} disabled={sending || !email}>
            {sending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Resend confirmation email
          </Button>
          <Button
            variant="ghost"
            className="mt-2 w-full"
            onClick={() =>
              getSupabaseClient()
                .auth.signOut()
                .then(() => window.location.replace("/workforce/professional/sign-in"))
            }
          >
            Use a different account
          </Button>
        </section>
      </div>
    </WorkspaceShell>
  );
}
