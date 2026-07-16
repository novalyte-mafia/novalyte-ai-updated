"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";
import { Logo } from "@/components/site/logo";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

function AuthCallbackComponent() {
  const supabaseClient = getSupabaseClient();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your request...");
  const [type, setType] = useState<string | null>(null);

  useEffect(() => {
    async function handleCallback() {
      // 1. Check if server-side route redirected us with status
      const queryStatus = searchParams.get("status");
      const queryType = searchParams.get("type");
      const queryMessage = searchParams.get("message");

      if (queryStatus === "success") {
        setStatus("success");
        setType(queryType);
        if (queryType === "recovery") {
          setMessage("Authentication verified. Redirecting to reset your password...");
          setTimeout(() => {
            window.location.href = "/workforce/professional/reset-password";
          }, 2000);
        } else {
          setMessage("Email confirmed successfully! Preparing your professional profile...");
          setTimeout(() => {
            window.location.href = "/workforce/professional";
          }, 2000);
        }
        return;
      } else if (queryStatus === "error") {
        setStatus("error");
        setMessage(queryMessage || "Authentication failed. The link may have expired or is invalid.");
        return;
      }

      // 2. Otherwise handle code exchange directly (for standard PKCE / email confirmation)
      const code = searchParams.get("code");
      const next = searchParams.get("next") || "/workforce/professional";
      const error = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");

      if (error) {
        setStatus("error");
        setMessage(errorDescription || "Authentication failed. Please request a new link.");
        return;
      }

      if (code) {
        try {
          const { data, error: exchangeError } = await supabaseClient.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            setStatus("error");
            if (exchangeError.message.includes("expired") || exchangeError.message.includes("invalid")) {
              setMessage("The authentication link has expired or is invalid. Please request a new one.");
            } else {
              setMessage(exchangeError.message);
            }
          } else {
            setStatus("success");
            const isRecovery = data.session?.user?.recovery_sent_at || next.includes("reset-password");
            if (isRecovery) {
              setType("recovery");
              setMessage("Authentication verified. Redirecting to reset your password...");
              setTimeout(() => {
                window.location.href = "/workforce/professional/reset-password";
              }, 2000);
            } else {
              setType("signup");
              setMessage("Email confirmed successfully! Preparing your professional profile...");
              setTimeout(() => {
                window.location.href = "/workforce/professional";
              }, 2000);
            }
          }
        } catch (err) {
          setStatus("error");
          setMessage("An unexpected error occurred during verification.");
        }
      } else {
        // No code and no status, check if user has active session
        const { data } = await supabaseClient.auth.getSession();
        if (data?.session) {
          setStatus("success");
          setMessage("You are already signed in. Checking your professional profile...");
          setTimeout(() => {
            window.location.href = "/workforce/professional";
          }, 2000);
        } else {
          setStatus("error");
          setMessage("No authentication parameters found. Please log in again.");
        }
      }
    }

    handleCallback();
  }, [searchParams]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header onGetStarted={() => {}} />

      <main className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-teal-50/20 via-background to-background">
        <div className="w-full max-w-md space-y-8 bg-white border border-neutral-200/80 p-8 rounded-3xl shadow-premium-md text-center">
          <div className="flex flex-col items-center">
            {/* Logo container */}
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-teal-500/20 bg-teal-50/50 shadow-premium-sm">
              <Logo size="md" showWord={false} animated={status === "loading"} />
            </div>

            <h2 className="mt-6 text-2xl font-bold tracking-tight text-foreground">
              {status === "loading" && "Verifying Authentication"}
              {status === "success" && "Authentication Successful"}
              {status === "error" && "Verification Failed"}
            </h2>
          </div>

          <div className="mt-4 p-4 rounded-2xl bg-neutral-50/80 border border-neutral-100 flex flex-col items-center justify-center min-h-[120px]">
            {status === "loading" && (
              <>
                <Loader2 className="h-8 w-8 text-teal-600 animate-spin mb-3" />
                <p className="text-sm text-muted-foreground font-medium">{message}</p>
              </>
            )}

            {status === "success" && (
              <>
                <CheckCircle className="h-10 w-10 text-emerald-500 mb-3 animate-bounce" />
                <p className="text-sm text-neutral-800 font-semibold">{message}</p>
              </>
            )}

            {status === "error" && (
              <>
                <XCircle className="h-10 w-10 text-rose-500 mb-3" />
                <p className="text-sm text-neutral-800 font-medium">{message}</p>
              </>
            )}
          </div>

          {status === "error" && (
            <div className="mt-6 flex flex-col gap-3">
              <Button
                className="w-full bg-teal-600 hover:bg-teal-700 font-semibold"
                onClick={() => {
                  window.location.href = "/workforce/professional/sign-in";
                }}
              >
                Go to Sign In
              </Button>
              <Button
                variant="outline"
                className="w-full border-neutral-200"
                onClick={() => {
                  window.location.href = "/";
                }}
              >
                Back to Homepage
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer onNewsletter={async () => {}} />
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col bg-background">
        <Header onGetStarted={() => {}} />
        <main className="flex-1 flex items-center justify-center bg-gradient-to-b from-teal-50/20 via-background to-background">
          <Loader2 className="h-8 w-8 text-teal-600 animate-spin" />
        </main>
        <Footer onNewsletter={async () => {}} />
      </div>
    }>
      <AuthCallbackComponent />
    </Suspense>
  );
}
