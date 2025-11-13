/**
 * Admin Cache Monitoring Page
 * Only accessible to administrators for monitoring cache performance
 */

import { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import CacheMonitoring from "@/components/admin/CacheMonitoring";
import { API } from "@/lib/translations";

export const metadata: Metadata = {
  title: "Cache Monitoring | Quản trị",
  description: "Theo dõi hiệu suất bộ nhớ đệm của hệ thống",
};

export default async function CacheAdminPage() {
  const session = await getServerSession(authOptions);

  // Redirect if not authenticated
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/admin/cache");
  }

  // Redirect if not admin
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard?error=" + encodeURIComponent(API.ERROR.UNAUTHORIZED));
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <CacheMonitoring />
      </div>
    </div>
  );
}
