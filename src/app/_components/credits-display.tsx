import { WonkCreditsIcon } from "@/icons";
import { ComponentProps, ReactNode } from "react";
import { XOR } from "ts-xor";

export type CreditsDisplayProps = {
  size?: ComponentProps<typeof WonkCreditsIcon>["size"];
  icon?: boolean;
  className?: string;
} & XOR<
  {
    credits: number;
  },
  {
    children: ReactNode;
  }
>;

export default function CreditsDisplay({
  credits,
  children,
  size = "1.5em",
  icon = true,
  className,
}: CreditsDisplayProps) {
  return (
    <span className={className}>
      {icon && (
        <span>
          <WonkCreditsIcon
            color="red"
            size={size}
            style={{ minWidth: size }}
            className="mr-2 inline align-middle"
          />
        </span>
      )}
      {credits && <span>{credits}</span>}
      {children && <span>{children}</span>}
    </span>
  );
}
