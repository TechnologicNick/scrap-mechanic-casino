"use client";

import React, { ChangeEvent, useRef, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Input,
} from "@nextui-org/react";
import CreditsDisplay from "./credits-display";
import DepositItemsDisplay from "./deposit-items-display";
import { signIn, useSession } from "next-auth/react";
import { api } from "~/trpc/react";

export const globalAddFundsModal = {
  onOpen: () => {},
};

export default function AddFundsModal() {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure({
    onClose: () => {
      setSelectedFile(null);
      setTotalCredits(0);
      setSeed(0);
      if (ref.current) {
        ref.current.value = "";
      }
    },
  });
  globalAddFundsModal.onOpen = onOpen;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [totalCredits, setTotalCredits] = useState<number>(0);
  const [seed, setSeed] = useState<number>(0);
  const { data: session } = useSession();

  const utils = api.useUtils();
  const addCredits = api.credits.addCredits.useMutation({
    onMutate: () => {
      utils.credits.getCredits.cancel();
      utils.credits.getCredits.setData(undefined, (credits) => {
        if (credits === undefined) {
          return;
        }
        return credits + totalCredits;
      });
    },
    onSuccess: () => {
      onClose();
    },
    onError: (error) => setError(error.message),
    onSettled: () => utils.credits.getCredits.invalidate(),
  });

  if (error) {
    console.log(error);
  }

  const ref = useRef<HTMLInputElement>(null);

  const onSelectFile = (event: ChangeEvent<HTMLInputElement>) => {
    Array.from(event.target.files!).forEach((file) => setSelectedFile(file));
    event.target.value = "";
  };

  const depositDisabled = !selectedFile || totalCredits === 0 || !!error;

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top-center">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Add funds</ModalHeader>
            <ModalBody>
              <p className="text-small">
                Deposit your in-game items to convert them into{" "}
                <CreditsDisplay
                  className="ml-[0.1em] [&_svg]:mr-[0.4em]"
                  size={14}
                >
                  Wonk Credits
                </CreditsDisplay>
                .
              </p>
              <div className="flex gap-2 pt-2">
                <input
                  ref={ref}
                  type="file"
                  accept=".db"
                  onChange={onSelectFile}
                  style={{ display: "none" }}
                />
                <Input
                  readOnly
                  label="Save file"
                  labelPlacement="outside"
                  placeholder="Select a save file to deposit items from"
                  variant="bordered"
                  onClick={() => !selectedFile && ref.current?.click()}
                  value={selectedFile?.name || ""}
                />
                <Button
                  color="primary"
                  className="place-self-end"
                  onPress={() => ref.current?.click()}
                >
                  Browse
                </Button>
              </div>
              <span className={`text-sm text-primary ${error ? "" : "-mb-3"}`}>
                {error ?? " "}
              </span>
              <DepositItemsDisplay
                file={selectedFile}
                setError={setError}
                setCredits={setTotalCredits}
                setSeed={setSeed}
              />
            </ModalBody>
            <ModalFooter>
              <Button color="default" variant="flat" onPress={onClose}>
                Close
              </Button>
              {session ? (
                <Button
                  color="primary"
                  isDisabled={depositDisabled}
                  onPress={() =>
                    addCredits.mutate({ seed, amount: totalCredits })
                  }
                  isLoading={addCredits.isPending}
                >
                  Deposit
                </Button>
              ) : (
                <Button
                  color="primary"
                  variant="shadow"
                  onPress={() => signIn("steam")}
                >
                  Login with Steam
                </Button>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
