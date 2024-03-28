"use client";

import { TRPCReactProvider } from "~/trpc/react";
import { NextUIProvider } from "@nextui-org/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TRPCReactProvider>
      <NextUIProvider>{children}</NextUIProvider>
    </TRPCReactProvider>
  );
}
