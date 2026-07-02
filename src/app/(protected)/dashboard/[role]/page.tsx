"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import RoleDashboard, { isValidRole } from "@/components/dashboard/RoleDashboard";
import type { UserRole } from "@/lib/roles";

export default function RoleDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const roleParam = params.role as string;

  useEffect(() => {
    if (!isValidRole(roleParam)) {
      router.replace("/dashboard");
      return;
    }

    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.role && data.user.role !== roleParam) {
          router.replace(`/dashboard/${data.user.role}`);
        }
      });
  }, [roleParam, router]);

  if (!isValidRole(roleParam)) return null;

  return <RoleDashboard role={roleParam as UserRole} />;
}
