import { Button, Input } from "@nextui-org/react";
import { memo, useCallback, useRef, useState } from "react";
import { WonkCreditsIcon } from "@/icons";

const validateNumber = (value: string, min: number, max: number) => {
  if (!/^\d+$/.test(value)) {
    return { valid: false as const, error: "Invalid number" };
  }

  const bet = parseInt(value);

  if (isNaN(bet)) {
    return { valid: false as const, error: "Invalid number" };
  }

  if (!isFinite(bet)) {
    return { valid: false as const, error: "Bet must be finite" };
  }

  if (bet > max) {
    return { valid: false as const, error: `Bet must be at most ${max}` };
  }

  if (bet < min) {
    return { valid: false as const, error: `Bet must be at least ${min}` };
  }

  return { valid: true as const, value: bet };
};

const clampAndRound = (value: number, min: number, max: number) => {
  return Math.max(min, Math.min(max, Math.round(value)));
};

export type BetAmountProps = {
  setBetAmount: (amount: number) => void;
  setBetValid: (valid: boolean) => void;
  min?: number;
  max?: number;
  defaultBet?: number;
};

export default memo(function BetAmount({
  setBetAmount,
  setBetValid,
  min = 10,
  max = Infinity,
  defaultBet,
}: BetAmountProps) {
  const [betNumber, setBetNumber] = useState<number>(defaultBet ?? min);
  const [betString, setBetString] = useState<string>(`${defaultBet}`);
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const setBet = useCallback(
    (value: number | ((oldValue: number) => number)) => {
      if (typeof value === "function") {
        value = value(betNumber);
      }
      value = clampAndRound(value, min, max);
      setBetNumber(value);
      setBetString(value.toString());
      setError(null);
      setBetAmount(value);
      setBetValid(true);
    },
    [betNumber, min, max],
  );

  const handleInput = useCallback(
    (value: string, replaceBetString = false) => {
      const { valid, error, value: bet } = validateNumber(value, min, max);

      setBetValid(valid);
      if (valid) {
        setError(null);
        setBetNumber(bet);
        setBetAmount(bet);
        if (replaceBetString) {
          setBetString(bet.toString());
        } else {
          setBetString(value);
        }
      } else {
        setError(error);
        setBetString(value);
      }
    },
    [betNumber, min, max],
  );

  return (
    <div className="flex flex-col gap-2 pt-2">
      <Input
        label="Bet amount"
        labelPlacement="outside"
        placeholder="The amount to bet"
        variant="bordered"
        startContent={<WonkCreditsIcon size={20} />}
        ref={input}
        errorMessage={error}
        classNames={{
          errorMessage: "text-sm",
        }}
        value={betString}
        onChange={(event) => handleInput(event.target.value)}
        onBlur={() => handleInput(betString, true)}
        type="number"
      />
      <div className="flex gap-2">
        <Button
          color="primary"
          onPress={() => setBet((currentBet) => currentBet / 2)}
          className="min-w-[unset] flex-1"
        >
          1/2
        </Button>
        <Button
          color="primary"
          onPress={() => setBet((currentBet) => currentBet * 2)}
          className="min-w-[unset] flex-1"
        >
          x2
        </Button>
        <Button
          color="primary"
          onPress={() => setBet(min)}
          className="min-w-[unset] flex-1"
        >
          Min
        </Button>
        <Button
          color="primary"
          onPress={() => setBet(max)}
          className="min-w-[unset] flex-1"
        >
          Max
        </Button>
      </div>
    </div>
  );
});
