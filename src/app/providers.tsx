"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryProvider } from "@/lib/cache/query-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider enableDevtools={process.env.NODE_ENV === "development"}>
      <SessionProvider>
        <TooltipProvider delayDuration={200}>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#363636",
                color: "#fff",
              },
            }}
          />
        </TooltipProvider>
      </SessionProvider>
    </QueryProvider>
  );
}
