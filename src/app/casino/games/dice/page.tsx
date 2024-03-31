"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Plane } from "@react-three/drei";
import { Physics, RigidBody } from "@react-three/rapier";
import { Die } from "@/models/die";
import { Platform } from "@/models/platform";

export default function Page() {
  return (
    <div className="h-full w-full">
      <Canvas shadows>
        <PerspectiveCamera
          name="camera"
          fov={40}
          near={10}
          far={1000}
          position={[10, 0, 50]}
        />
        <OrbitControls />
        <ambientLight intensity={0.1} />
        <directionalLight color="white" position={[2, 4, 5]} castShadow />
        <Physics gravity={[0, -30, 0]}>
          <RigidBody gravityScale={0} position={[0, -2, 0]}>
            <Platform />
          </RigidBody>
          <RigidBody>
            <Die />
          </RigidBody>
        </Physics>
      </Canvas>
    </div>
  );
}
