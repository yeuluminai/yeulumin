"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Html, Loader } from "@react-three/drei";
import TshirtModel from "./TshirtModel";

function ViewerFallback() {
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center min-w-[200px]">
        <div className="h-6 w-6 border-2 border-[#00FFB2] border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-[10px] font-mono text-[#666] tracking-[2px] uppercase">
          Synthesizing 3D...
        </span>
      </div>
    </Html>
  );
}

interface TshirtViewerProps {
  scale?: number;
  autoRotateSpeed?: number;
  cameraDistance?: number;
}

export default function TshirtViewer({
  scale = 1.1,
  autoRotateSpeed = 1.0,
  cameraDistance = 4.2,
}: TshirtViewerProps) {
  return (
    <div className="relative w-full h-full bg-transparent cursor-grab active:cursor-grabbing">
      <Canvas
        gl={{ antialias: true }}
        dpr={[1, 2]}
        camera={{ position: [0, 0.5, cameraDistance], fov: 45 }}
      >
        <ambientLight intensity={0.4} />
        
        {/* Lights mapping for realistic reflections */}
        <directionalLight position={[2, 3, 3]} intensity={1.2} />
        <directionalLight position={[-3, 1, -1]} intensity={0.4} color="#8899ff" />
        <directionalLight position={[0, 2, -3]} intensity={0.3} color="#00FFB2" />

        <Suspense fallback={<ViewerFallback />}>
          <TshirtModel scale={scale} autoRotateSpeed={autoRotateSpeed} />
          <Environment preset="city" />
        </Suspense>
      </Canvas>


    </div>
  );
}
