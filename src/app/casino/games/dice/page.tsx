"use client";

import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import {
  CameraControls,
  CameraControlsProps,
  PerspectiveCamera,
} from "@react-three/drei";
import {
  Physics,
  RapierRigidBody,
  RigidBody,
  useAfterPhysicsStep,
} from "@react-three/rapier";
import { Die } from "@/models/die";
import { Platform } from "@/models/platform";
import { RefObject, useRef, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Checkbox,
  CheckboxGroup,
  Divider,
} from "@nextui-org/react";
import { Vector3 } from "three";
import BetAmount from "@/components/bet-amount";
import CreditsDisplay from "@/components/credits-display";

type FollowCameraControlsProps = CameraControlsProps & {
  followRef: RefObject<RapierRigidBody>;
  dieRef: RefObject<THREE.Group>;
};

const FollowCameraControls = ({
  followRef,
  dieRef,
  ...rest
}: FollowCameraControlsProps) => {
  const controls = useRef<CameraControls>(null);

  useAfterPhysicsStep(() => {
    if (
      !followRef.current ||
      !controls.current ||
      !dieRef.current ||
      followRef.current.isSleeping()
    ) {
      return;
    }

    const position = followRef.current.translation();
    const offset = new Vector3(0, 0, 0);

    let updated = false;
    const repeat = 4;
    if (position.x > repeat) {
      offset.x -= repeat;
    }

    if (position.x < -repeat) {
      offset.x += repeat;
    }

    if (position.z > repeat) {
      offset.z -= repeat;
    }

    if (position.z < -repeat) {
      offset.z += repeat;
    }

    if (offset.lengthSq() > 0) {
      followRef.current.setTranslation(offset.clone().add(position), true);
      const cameraPosition = new THREE.Vector3();
      controls.current.getPosition(cameraPosition);
      cameraPosition.add(offset);

      const targetPosition = offset.clone().add(position);

      controls.current.setLookAt(
        cameraPosition.x,
        cameraPosition.y,
        cameraPosition.z,
        targetPosition.x,
        targetPosition.y,
        targetPosition.z,
      );
      controls.current.update(0);
    } else {
      controls.current.setTarget(position.x, position.y, position.z);
    }

    if (controls.current.distance > controls.current.maxDistance) {
      controls.current.dollyTo(controls.current.maxDistance, false);
    }
  });

  return <CameraControls {...rest} ref={controls} />;
};

const getProfitOnWin = (bet: number, sideCount: number) => {
  const winChance = (1 / 6) * sideCount;
  const winAmount = bet / winChance;
  const profit = winAmount - bet;
  return Math.round(profit);
};

type GuessCardProps = {
  roll: () => void;
};

const GuessCard = ({ roll }: GuessCardProps) => {
  const [isInvalid, setIsInvalid] = useState(false);
  const [bet, setBet] = useState<number>(0);
  const [betValid, setBetValid] = useState(false);
  const [sides, setSides] = useState<number[]>([6]);

  const profitOnWin = getProfitOnWin(bet, sides.length);

  return (
    <Card
      isBlurred
      radius="lg"
      shadow="sm"
      className="border border-primary !bg-black/40"
    >
      <CardBody>
        <CheckboxGroup
          label="Guess outcomes"
          defaultValue={["6"]}
          isInvalid={isInvalid}
          onValueChange={(value) => {
            setIsInvalid(value.length === 0 || value.length == 6);
            setSides(value.map((v) => parseInt(v)));
          }}
          classNames={{
            wrapper: "grid grid-cols-2",
          }}
          errorMessage={isInvalid && "Please select 1 to 5 outcomes"}
        >
          <Checkbox value="1">1</Checkbox>
          <Checkbox value="2">2</Checkbox>
          <Checkbox value="3">3</Checkbox>
          <Checkbox value="4">4</Checkbox>
          <Checkbox value="5">5</Checkbox>
          <Checkbox value="6">6</Checkbox>
        </CheckboxGroup>
        <BetAmount setBetAmount={setBet} setBetValid={setBetValid} />
        <Divider className="my-4" />
        <p className="text-sm">
          Win chance: {((1 / 6) * sides.length * 100).toFixed(0)}%
        </p>
        <p className="mt-2 text-sm">
          Profit on win:{" "}
          <CreditsDisplay className="ml-1">{profitOnWin}</CreditsDisplay>
        </p>
      </CardBody>
      <CardFooter className="bg-black/40">
        <div className="flex justify-center">
          <Button color="primary" onPress={roll} isDisabled={!betValid}>
            Roll
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default function Page() {
  const dieRigidBody = useRef<RapierRigidBody>(null);
  const directionalLight = useRef<THREE.DirectionalLight>(null);
  const die = useRef<THREE.Group>(null);

  const roll = () => {
    const direction = Math.random() * Math.PI * 2;
    const force = 100 + Math.random() * 20;

    const point = new Vector3(
      Math.cos(direction - Math.PI / 2),
      0,
      Math.sin(direction - Math.PI / 2),
    )
      .normalize()
      .multiplyScalar(force / 2);

    dieRigidBody.current?.applyImpulse(
      new Vector3(
        Math.cos(direction) * force,
        force,
        Math.sin(direction) * force,
      ),
      true,
    );
    dieRigidBody.current?.applyTorqueImpulse(point, true);
  };

  return (
    <div className="relative h-full w-full">
      <Canvas shadows>
        <PerspectiveCamera
          name="camera"
          fov={40}
          near={10}
          far={1000}
          position={[10, 0, 50]}
        />
        <ambientLight intensity={0.1} />
        <directionalLight
          color="white"
          position={[2, 4, 5]}
          castShadow
          ref={directionalLight}
        />
        <Physics gravity={[0, -30, 0]} timeStep={"vary"}>
          <FollowCameraControls
            followRef={dieRigidBody}
            dieRef={die}
            maxDistance={10}
          />
          <RigidBody position={[0, -2, 0]} type="fixed">
            <Platform />
          </RigidBody>
          <RigidBody ref={dieRigidBody} restitution={0.6} friction={0.8}>
            <Die groupRef={die} />
          </RigidBody>
        </Physics>
      </Canvas>
      <div className="absolute bottom-2 right-2 top-2 grid items-center">
        <GuessCard roll={roll} />
      </div>
    </div>
  );
}
