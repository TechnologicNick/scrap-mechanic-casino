"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Die } from "@/models/die";

export default function Page() {
  return (
    <div className="h-full w-full">
      <Canvas>
        <PerspectiveCamera
          name="camera"
          fov={40}
          near={10}
          far={1000}
          position={[10, 0, 50]}
        />
        <OrbitControls />
        <ambientLight intensity={0.1} />
        <directionalLight color="white" position={[2, 4, 5]} />
        <Die />
      </Canvas>
    </div>
  );
}
