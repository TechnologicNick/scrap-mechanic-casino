import { Button, Spinner } from "@nextui-org/react";
import CreditsDisplay, { CreditsDisplayProps } from "./credits-display";
import { globalAddFundsModal } from "./add-funds-modal";
import { TiPlus } from "react-icons/ti";
import { Session } from "next-auth";
import { CONFIG } from "~/config";
import { api } from "~/trpc/react";

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
      <CreditsDisplay {...creditsProps} className="flex items-center" />
      <div className="flex h-6 w-6 min-w-[unset] items-center justify-center rounded-md bg-primary">
        <TiPlus size={20} />
      </div>
    </Button>
  );
}

export type PersonalAddFundsButtonProps = {
  user?: Session["user"];
};

export const PersonalAddFundsButton = ({
  user,
}: PersonalAddFundsButtonProps) => {
  const { data, isLoading } = api.credits.getCredits.useQuery(undefined, {
    enabled: !!user,
    initialData: CONFIG.STARTING_CREDITS,
  });

  if (isLoading) {
    return (
      <AddFundsButton>
        <Spinner size="sm" />
      </AddFundsButton>
    );
  }

  if (data) {
    return <AddFundsButton credits={data} />;
  }

  return <AddFundsButton>???</AddFundsButton>;
};
