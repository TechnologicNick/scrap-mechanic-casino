"use client";

import { memo, useEffect, useState } from "react";
import SaveEditor, { SQL, initSql } from "@/save-editor/save-editor";
import Container from "@/save-editor/structures/container";
import { UuidString } from "../_save-editor/structures/uuid";
import {
  Divider,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import CreditsDisplay from "./credits-display";
import GameMode from "../_save-editor/types/game-mode";

export type DepositItemsDisplayProps = {
  file: File | null;
  setError?: (error: string | null) => void;
  setCredits?: (credits: number) => void;
  setSeed?: (seed: number) => void;
};

const depositPrices = {
  "5530e6a0-4748-4926-b134-50ca9ecb9dcf": { name: "Component Kit", price: 500 },
  "f152e4df-bc40-44fb-8d20-3b3ff70cdfe3": { name: "Circuit Board", price: 250 },
  "e49b210a-0d46-4f06-bcd8-08862379d156": {
    name: "Warehouse Key",
    price: 1000,
  },
} as const satisfies Record<UuidString, { name: string; price: number }>;

type DepositableItemUuid = keyof typeof depositPrices;

const isDepositableItemUuid = (
  uuid: UuidString,
): uuid is DepositableItemUuid => {
  return uuid in depositPrices;
};

const getTotalCredits = (itemCounts: Record<DepositableItemUuid, number>) => {
  return Object.entries(depositPrices).reduce(
    (total, [uuid, { price }]) =>
      total + itemCounts[uuid as DepositableItemUuid] * price,
    0,
  );
};

export default memo(function DepositItemsDisplay({
  file,
  setError,
  setCredits,
  setSeed,
}: DepositItemsDisplayProps) {
  const [itemCounts, setItemCounts] = useState(
    Object.fromEntries(
      Object.keys(depositPrices).map((uuid) => [uuid, 0]),
    ) as Record<DepositableItemUuid, number>,
  );

  useEffect(() => {
    (async () => {
      if (file === null) {
        return;
      }

      try {
        if (!SQL) {
          setError?.("Downloading SQL.js...");
          await initSql();
        }
      } catch (error) {
        console.error(error);
        setError?.(
          `Failed to download SQL.js: ${error instanceof Error ? error.message : error}`,
        );
        return;
      }

      const saveEditor = new SaveEditor(file);
      try {
        setError?.("Loading save file...");
        await saveEditor.loadDatabase();
      } catch (error) {
        console.error(error);
        setError?.(
          `Failed to load save file: ${error instanceof Error ? error.message : error}`,
        );
        return;
      }

      try {
        const version = saveEditor.getVersion();
        if (version < 26 || version > 27) {
          setError?.(
            `Unsupported save version: ${version}. Only the latest save version is supported.`,
          );
        }
      } catch (error) {
        console.error(error);
        setError?.(
          `Failed to get save version: ${error instanceof Error ? error.message : error}`,
        );
        return;
      }

      let seed: number;
      try {
        seed = saveEditor.getSeed();
        setSeed?.(seed);
      } catch (error) {
        console.error(error);
        setError?.(
          `Failed to get seed: ${error instanceof Error ? error.message : error}`,
        );
        return;
      }

      try {
        const gameMode = saveEditor.getGameMode();
        console.log(gameMode);
        if (![GameMode.Survival, GameMode.Custom].includes(gameMode)) {
          setError?.("Only Survival mode and Custom Games can be deposited!");
          return;
        }
      } catch (error) {
        console.error(error);
        setError?.(
          `Failed to get game mode: ${error instanceof Error ? error.message : error}`,
        );
        return;
      }

      let containers: Container[];
      try {
        containers = saveEditor.getAllContainers();
        console.log(containers);
      } catch (error) {
        console.error(error);
        setError?.(
          `Failed to get containers: ${error instanceof Error ? error.message : error}`,
        );
        return;
      }

      const itemCounts = Object.fromEntries(
        Object.keys(depositPrices).map((uuid) => [uuid, 0]),
      ) as Record<DepositableItemUuid, number>;

      for (const container of containers) {
        for (const item of container.items) {
          const uuid = item.uuid.toString();
          if (isDepositableItemUuid(uuid)) {
            itemCounts[uuid] += item.quantity;
          }
        }
      }

      setItemCounts(itemCounts);

      const totalItems = Object.values(itemCounts).reduce(
        (total, count) => total + count,
        0,
      );
      setError?.(totalItems === 0 ? "No depositable items found." : null);
      setCredits?.(getTotalCredits(itemCounts));
    })();
  }, [file]);

  return (
    <div className="text-sm">
      <Table
        removeWrapper
        tabIndex={-1}
        aria-label="Table containing the amount of credits in the save file"
      >
        <TableHeader>
          <TableColumn>ITEM</TableColumn>
          <TableColumn>CREDITS</TableColumn>
        </TableHeader>
        <TableBody items={Object.entries(depositPrices)}>
          {([uuid, { name, price }]) => (
            <TableRow tabIndex={-1} key={uuid}>
              <TableCell>{name}</TableCell>
              <TableCell>
                {itemCounts[uuid as DepositableItemUuid]} x {price} ={" "}
                {itemCounts[uuid as DepositableItemUuid] * price}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Divider className="mb-4 mt-2" />
      <span>
        Total:{" "}
        <CreditsDisplay
          className="ml-[0.1em] [&_svg]:mr-[0.4em]"
          credits={getTotalCredits(itemCounts)}
        />
      </span>
    </div>
  );
});
