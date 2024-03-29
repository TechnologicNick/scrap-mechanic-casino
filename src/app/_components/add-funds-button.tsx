import { Button } from "@nextui-org/react";
import CreditsDisplay, { CreditsDisplayProps } from "./credits-display";
import { globalAddFundsModal } from "./add-funds-modal";
import { TiPlus } from "react-icons/ti";

export type AddFundsButtonProps = CreditsDisplayProps;

export default function AddFundsButton({
  ...creditsProps
}: AddFundsButtonProps) {
  return (
    <Button
      variant="light"
      onPress={() => globalAddFundsModal.onOpen()}
      className="flex gap-4"
      aria-label="Add funds"
    >
      <CreditsDisplay {...creditsProps} />
      <div className="flex h-6 w-6 min-w-[unset] items-center justify-center rounded-md bg-primary">
        <TiPlus size={20} />
      </div>
    </Button>
  );
}
