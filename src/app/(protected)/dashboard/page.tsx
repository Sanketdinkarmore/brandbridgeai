"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { getDashboardPath, type UserRole } from "@/lib/roles";
import { redirectAfterAuth } from "@/lib/auth-client";

export default function DashboardRedirectPage() {
  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        const role = data.user?.role as UserRole | undefined;
        if (role) {
          redirectAfterAuth(getDashboardPath(role));
        } else {
          redirectAfterAuth("/signup");
        }
      })
      .catch(() => redirectAfterAuth("/login"));
  }, []);

  return (
    <div className="flex min-h-[40vh] items-center justify-center gap-2">
      <Loader2 className="animate-spin text-purple-400" size={20} />
      <p className="text-sm text-white/50">Redirecting to your dashboard...</p>
    </div>
  );
}
