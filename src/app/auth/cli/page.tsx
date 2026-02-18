"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function CliAuthContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState("Connecting to CLI...");

  useEffect(() => {
    async function handleAuth() {
      const port = searchParams.get("port");
      if (!port) {
        setStatus("Missing port parameter.");
        return;
      }

      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push(`/login?redirect=${encodeURIComponent(`/auth/cli?port=${port}`)}`);
        return;
      }

      const callbackUrl = `http://localhost:${port}/callback?access_token=${session.access_token}&refresh_token=${session.refresh_token}`;
      setStatus("Authenticated! Redirecting to CLI...");
      window.location.href = callbackUrl;
    }

    handleAuth();
  }, [searchParams, router]);

  return (
    <div className="text-center space-y-2">
      <p className="text-sm font-medium">{status}</p>
      <p className="text-xs text-muted-foreground">
        You can close this tab after authentication completes.
      </p>
    </div>
  );
}

export default function CliAuthPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading...</p>}>
        <CliAuthContent />
      </Suspense>
    </div>
  );
}
