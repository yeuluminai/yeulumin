"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Decal, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useViewerStore } from "./useViewerStore";

// Preload the GLB model
useGLTF.preload("/models/tshirt.glb");

// Helper function to generate design textures on a 512x512 canvas
function generateDesignTexture(designId: string): THREE.CanvasTexture | null {
  if (designId === "none" || designId === "logo") return null;

  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Clear canvas
  ctx.clearRect(0, 0, 512, 512);

  if (designId === "stripe") {
    ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
    for (let i = 0; i < 10; i++) {
      if (i % 2 === 0) {
        ctx.fillRect(0, i * 52, 512, 52);
      }
    }
  } else if (designId === "abstract") {
    // 8 radial gradients
    for (let i = 0; i < 8; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const r = 50 + Math.random() * 100;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, "rgba(123, 47, 255, 0.6)");
      grad.addColorStop(1, "rgba(123, 47, 255, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    // 6 bezier curves
    ctx.strokeStyle = "rgba(0, 255, 178, 0.3)";
    ctx.lineWidth = 4;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * 512, Math.random() * 512);
      ctx.bezierCurveTo(
        Math.random() * 512, Math.random() * 512,
        Math.random() * 512, Math.random() * 512,
        Math.random() * 512, Math.random() * 512
      );
      ctx.stroke();
    }
  } else if (designId === "circuit") {
    // Generate 12 random grid-snapped points (on a 60px grid)
    const points: { x: number; y: number }[] = [];
    const gridSize = 60;
    const cols = Math.floor(512 / gridSize);
    for (let i = 0; i < 12; i++) {
      const col = Math.floor(Math.random() * (cols - 2)) + 1;
      const row = Math.floor(Math.random() * (cols - 2)) + 1;
      points.push({ x: col * gridSize + gridSize / 2, y: row * gridSize + gridSize / 2 });
    }

    // Connect them with L-shaped paths (horizontal then vertical)
    ctx.strokeStyle = "rgba(0, 255, 178, 0.35)";
    ctx.lineWidth = 3;
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p1.y); // Horizontal
      ctx.lineTo(p2.x, p2.y); // Vertical
      ctx.stroke();
    }

    // Draw 4px filled circles at each point
    ctx.fillStyle = "#00FFB2";
    for (const p of points) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (designId === "ai") {
    // Central radial gradient
    const grad = ctx.createRadialGradient(256, 256, 0, 256, 256, 200);
    grad.addColorStop(0, "rgba(123, 47, 255, 0.3)");
    grad.addColorStop(1, "rgba(123, 47, 255, 0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(256, 256, 200, 0, Math.PI * 2);
    ctx.fill();

    // 20 random semi-transparent circles with purple/mint strokes
    for (let i = 0; i < 20; i++) {
      ctx.strokeStyle = Math.random() > 0.5 ? "rgba(123, 47, 255, 0.4)" : "rgba(0, 255, 178, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(Math.random() * 512, Math.random() * 512, 10 + Math.random() * 40, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Hexagon glyph "⬡" in white at center
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 120px sans-serif";
    ctx.fillText("⬡", 256, 256);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

interface TshirtModelProps {
  scale?: number;
  autoRotateSpeed?: number;
}

export default function TshirtModel({
  scale = 1.1,
  autoRotateSpeed = 1.0,
}: TshirtModelProps) {
  const { color, design, view, customTextureUrl, decalScale, decalPosY, decalPosX, decalTarget } = useViewerStore();
  const meshRef = useRef<THREE.Mesh>(null);
  const controlsRef = useRef<any>(null);

  // Access three.js canvas size
  const { size: canvasSize } = useThree();

  // Dynamically adjust scale on narrow screen aspect ratios to maximize size without clipping
  const responsiveScale = useMemo(() => {
    const aspect = canvasSize.width / canvasSize.height;
    if (aspect < 1) {
      // Scale up on portrait viewports
      const scaleMultiplier = Math.min(2.25, 1.2 / aspect);
      return scale * scaleMultiplier;
    }
    return scale;
  }, [scale, canvasSize.width, canvasSize.height]);

  // Load the GLTF/GLB model
  const { nodes, materials } = useGLTF("/models/tshirt.glb") as any;

  // Locate the T-shirt mesh dynamically
  const meshKey = useMemo(() => {
    return Object.keys(nodes).find((key) => nodes[key].type === "Mesh") || "T_Shirt_male";
  }, [nodes]);
  const shirtMeshNode = nodes[meshKey];

  // Apply fabric color to the material dynamically when color changes
  useEffect(() => {
    if (shirtMeshNode && shirtMeshNode.material) {
      shirtMeshNode.material.color.set(color);
      // Remove ambient occlusion map to prevent the backside of the shirt from rendering black
      shirtMeshNode.material.aoMap = null;
      shirtMeshNode.material.roughness = 0.6;
      shirtMeshNode.material.needsUpdate = true;
    }
  }, [color, shirtMeshNode]);

  // Generate decal canvas texture (for non-logo designs)
  const [canvasTexture, setCanvasTexture] = useState<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    // If we have a custom generated AI image, we don't need the procedural CanvasTexture
    if (design === "ai" && customTextureUrl) {
      setCanvasTexture(null);
      return;
    }
    const newTex = generateDesignTexture(design);
    setCanvasTexture(newTex);

    return () => {
      if (newTex) {
        newTex.dispose();
      }
    };
  }, [design, customTextureUrl]);

  // Load real logo image texture for the 'logo' design
  const [logoTexture, setLogoTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (design !== "logo") {
      setLogoTexture(null);
      return;
    }
    const loader = new THREE.TextureLoader();
    const tex = loader.load("/logos/trimmed_yeulumin ai-05.png", (loaded) => {
      loaded.needsUpdate = true;
      setLogoTexture(loaded);
    });
    return () => {
      tex.dispose();
    };
  }, [design]);

  // Load Stability AI generated texture when design === "ai" and customTextureUrl is set
  const [customTexture, setCustomTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (design !== "ai" || !customTextureUrl) {
      setCustomTexture(null);
      return;
    }
    const loader = new THREE.TextureLoader();
    const tex = loader.load(customTextureUrl, (loaded) => {
      loaded.needsUpdate = true;
      setCustomTexture(loaded);
    });
    return () => {
      tex.dispose();
    };
  }, [design, customTextureUrl]);

  // State to manage autoRotate toggle on interaction
  const [autoRotate, setAutoRotate] = useState(true);
  const autoRotateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleStart = () => {
    setAutoRotate(false);
    isAnimatingRef.current = false; // Stop camera view transition if user drags
    if (autoRotateTimeoutRef.current) {
      clearTimeout(autoRotateTimeoutRef.current);
    }
  };

  const handleEnd = () => {
    if (autoRotateTimeoutRef.current) {
      clearTimeout(autoRotateTimeoutRef.current);
    }
    autoRotateTimeoutRef.current = setTimeout(() => {
      setAutoRotate(true);
    }, 3000);
  };

  // Camera preset view transitions
  const prevViewRef = useRef<string>(view);
  const isAnimatingRef = useRef<boolean>(false);
  const targetAzimuth = useRef(0);
  const targetPolar = useRef(1.4);

  useEffect(() => {
    if (view !== prevViewRef.current) {
      prevViewRef.current = view;
      isAnimatingRef.current = true;

      if (view === "front") {
        targetAzimuth.current = 0;
        targetPolar.current = 1.4;
      } else if (view === "back") {
        targetAzimuth.current = Math.PI;
        targetPolar.current = 1.4;
      } else if (view === "side") {
        targetAzimuth.current = Math.PI / 2.5;
        targetPolar.current = 1.4;
      }
    }
  }, [view]);

  useFrame((state) => {
    // 1. Subtle floating animation
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.6) * 0.02;
    }

    // 2. Animate camera view preset transitions
    if (isAnimatingRef.current && controlsRef.current) {
      const camera = state.camera;
      const target = controlsRef.current.target || new THREE.Vector3(0, -0.55, 0);

      // Get current position in spherical coordinates relative to target
      const relPos = new THREE.Vector3().copy(camera.position).sub(target);
      const spherical = new THREE.Spherical().setFromVector3(relPos);

      // Spherical lerping
      const targetAz = targetAzimuth.current;
      const targetPol = targetPolar.current;

      let diffTheta = targetAz - spherical.theta;
      // Normalize azimuthal angle diff to [-PI, PI] to rotate the shortest path
      diffTheta = Math.atan2(Math.sin(diffTheta), Math.cos(diffTheta));

      spherical.theta += diffTheta * 0.08;
      spherical.phi = THREE.MathUtils.lerp(spherical.phi, targetPol, 0.08);

      // Map back to cartesian coordinates and update camera
      const newRelPos = new THREE.Vector3().setFromSpherical(spherical);
      camera.position.copy(target).add(newRelPos);

      controlsRef.current.update();

      // Check if animation is complete
      const azClose = Math.abs(diffTheta) < 0.01;
      const polClose = Math.abs(spherical.phi - targetPol) < 0.01;
      if (azClose && polClose) {
        isAnimatingRef.current = false;
      }
    }
  });

  const isBack = decalTarget === "back";
  const decalZ = isBack ? -0.125 : 0.125; // slightly increase offset to prevent z-fighting on back
  const decalRotY = isBack ? Math.PI : 0;
  const adjustedPosX = isBack ? -decalPosX : decalPosX;

  return (
    <>
      <group position={[0, -0.55, 0]} scale={[responsiveScale, responsiveScale, responsiveScale]}>
        <mesh
          ref={meshRef}
          geometry={shirtMeshNode.geometry}
          material={shirtMeshNode.material}
        >
          {canvasTexture && (
            <Decal
              mesh={meshRef as any}
              position={[adjustedPosX, decalPosY, decalZ]}
              rotation={[0, decalRotY, 0]}
              scale={[decalScale, decalScale, decalScale]}
              map={canvasTexture}
              polygonOffsetFactor={-1}
            />
          )}
          {logoTexture && (
            <Decal
              mesh={meshRef as any}
              position={[adjustedPosX, decalPosY, decalZ]}
              rotation={[0, decalRotY, 0]}
              scale={[decalScale, decalScale, decalScale]}
              map={logoTexture}
              polygonOffsetFactor={-1}
            />
          )}
          {customTexture && (
            <Decal
              mesh={meshRef as any}
              position={[adjustedPosX, decalPosY, decalZ]}
              rotation={[0, decalRotY, 0]}
              scale={[decalScale, decalScale, decalScale]}
              map={customTexture}
              polygonOffsetFactor={-1}
            />
          )}
        </mesh>
      </group>

      <OrbitControls
        ref={controlsRef}
        target={[0, -0.55, 0]}
        enablePan={false}
        minDistance={1.5}
        maxDistance={5}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.6}
        enableDamping
        dampingFactor={0.08}
        autoRotate={autoRotate}
        autoRotateSpeed={autoRotateSpeed}
        onStart={handleStart}
        onEnd={handleEnd}
      />
    </>
  );
}
