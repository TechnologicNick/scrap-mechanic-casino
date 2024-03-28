"use client";

import { TRPCReactProvider } from "~/trpc/react";
import { NextUIProvider } from "@nextui-org/react";
import { useRouter } from "next/navigation";

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <TRPCReactProvider>
      <NextUIProvider navigate={router.push}>{children}</NextUIProvider>
    </TRPCReactProvider>
  );
}
