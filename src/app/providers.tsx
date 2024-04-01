"use client";

import { TRPCReactProvider } from "~/trpc/react";
import { NextUIProvider } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <TRPCReactProvider>
      <SessionProvider>
        <NextUIProvider navigate={router.push}>{children}</NextUIProvider>
      </SessionProvider>
    </TRPCReactProvider>
  );
}
