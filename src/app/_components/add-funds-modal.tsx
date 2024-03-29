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
  Checkbox,
  Input,
  Link,
} from "@nextui-org/react";
import CreditsDisplay from "./credits-display";

export const globalAddFundsModal = {
  onOpen: () => {},
};

export default function AddFundsModal() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  globalAddFundsModal.onOpen = onOpen;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const ref = useRef<HTMLInputElement>(null);

  const onSelectFile = (event: ChangeEvent<HTMLInputElement>) => {
    Array.from(event.target.files!).forEach((file) => setSelectedFile(file));
    event.target.value = "";
  };

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
            </ModalBody>
            <ModalFooter>
              <Button color="default" variant="flat" onPress={onClose}>
                Close
              </Button>
              <Button color="primary" onPress={onClose}>
                Deposit
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
