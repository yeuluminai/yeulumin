"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface ThreeMannequinProps {
  shirtColor: string; // hex color
  designImage: string | null; // URL/base64
  view: "front" | "back";
  isGenerating?: boolean;
}

export default function ThreeMannequin({
  shirtColor,
  designImage,
  view,
  isGenerating = false,
}: ThreeMannequinProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Three.js object references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const shirtGroupRef = useRef<THREE.Group | null>(null);
  const frontMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const defaultMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const backMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);

  // User interaction state
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const targetRotationY = useRef(0);
  const currentRotationY = useRef(0);
  const targetRotationX = useRef(0);
  const currentRotationX = useRef(0);

  // Set target rotation based on view prop
  useEffect(() => {
    if (view === "front") {
      targetRotationY.current = 0;
    } else {
      targetRotationY.current = Math.PI; // 180 degrees
    }
  }, [view]);

  // Handle color change
  useEffect(() => {
    if (defaultMaterialRef.current && frontMaterialRef.current && backMaterialRef.current) {
      const color = new THREE.Color(shirtColor);
      defaultMaterialRef.current.color = color;
      frontMaterialRef.current.color = color;
      backMaterialRef.current.color = color;
    }
  }, [shirtColor]);

  // Handle texture change
  useEffect(() => {
    if (!frontMaterialRef.current) return;

    if (designImage) {
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(
        designImage,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.minFilter = THREE.LinearFilter;
          if (frontMaterialRef.current) {
            frontMaterialRef.current.map = texture;
            frontMaterialRef.current.needsUpdate = true;
          }
        },
        undefined,
        (err) => {
          console.error("Error loading design texture", err);
        }
      );
    } else {
      frontMaterialRef.current.map = null;
      frontMaterialRef.current.needsUpdate = true;
    }
  }, [designImage]);

  // Initialize Three.js Scene
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.5, 4.5);
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    const frontLight = new THREE.DirectionalLight(0xffffff, 0.8);
    frontLight.position.set(0, 1.5, 3.5);
    scene.add(frontLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 0.5);
    backLight.position.set(0, 1.5, -3.5);
    scene.add(backLight);

    const sideLightNeon = new THREE.PointLight("#00FFB2", 2, 8);
    sideLightNeon.position.set(2, 0.5, 1);
    scene.add(sideLightNeon);

    const sideLightViolet = new THREE.PointLight("#7B2FFF", 1.5, 8);
    sideLightViolet.position.set(-2, 0.5, 1);
    scene.add(sideLightViolet);

    // 5. Build Hanger and Stand
    const standGroup = new THREE.Group();

    // Metallic material
    const metalMaterial = new THREE.MeshStandardMaterial({
      color: 0x1f1f1f,
      metalness: 0.9,
      roughness: 0.15,
    });

    // Base
    const baseGeom = new THREE.CylinderGeometry(0.4, 0.42, 0.04, 32);
    const baseMesh = new THREE.Mesh(baseGeom, metalMaterial);
    baseMesh.position.y = -1.6;
    standGroup.add(baseMesh);

    // Vertical rod
    const rodGeom = new THREE.CylinderGeometry(0.015, 0.015, 3.2, 16);
    const rodMesh = new THREE.Mesh(rodGeom, metalMaterial);
    rodMesh.position.y = 0;
    standGroup.add(rodMesh);

    // Hanger hook & bar
    const hangerHookGeom = new THREE.TorusGeometry(0.08, 0.01, 8, 24, Math.PI);
    const hangerHook = new THREE.Mesh(hangerHookGeom, metalMaterial);
    hangerHook.position.set(0, 1.35, 0);
    hangerHook.rotation.z = -Math.PI / 2;
    standGroup.add(hangerHook);

    const hangerBarGeom = new THREE.CylinderGeometry(0.012, 0.012, 1.3, 16);
    const hangerBar = new THREE.Mesh(hangerBarGeom, metalMaterial);
    hangerBar.position.set(0, 1.25, 0);
    hangerBar.rotation.z = Math.PI / 2;
    standGroup.add(hangerBar);

    scene.add(standGroup);

    // 6. Build T-Shirt Mesh Group
    const shirtGroup = new THREE.Group();
    shirtGroup.position.y = 0.2; // center on stand
    shirtGroupRef.current = shirtGroup;

    // Materials
    const tColor = new THREE.Color(shirtColor);
    const defaultMat = new THREE.MeshStandardMaterial({
      color: tColor,
      roughness: 0.75,
      metalness: 0.05,
    });
    defaultMaterialRef.current = defaultMat;

    const frontMat = new THREE.MeshStandardMaterial({
      color: tColor,
      roughness: 0.75,
      metalness: 0.05,
    });
    frontMaterialRef.current = frontMat;

    // Draw brand watermark on back canvas
    const backCanvas = document.createElement("canvas");
    backCanvas.width = 512;
    backCanvas.height = 512;
    const backCtx = backCanvas.getContext("2d");
    const backTexture = new THREE.CanvasTexture(backCanvas);
    backTexture.colorSpace = THREE.SRGBColorSpace;

    const redrawBackCanvas = (isLight: boolean) => {
      if (!backCtx) return;
      
      const bgColor = isLight ? "#fafafa" : "#000000";
      const strokeColor = isLight ? "#e4e4e7" : "#222222";
      const textColor = isLight ? "#0a0a0a" : "#f5f5f5";
      const subtextColor = isLight ? "#7B2FFF" : "#00FFB2";

      backCtx.fillStyle = bgColor;
      backCtx.fillRect(0, 0, 512, 512);

      // Circular frame
      backCtx.strokeStyle = strokeColor;
      backCtx.lineWidth = 4;
      backCtx.beginPath();
      backCtx.arc(256, 220, 100, 0, Math.PI * 2);
      backCtx.stroke();

      // Brand Wordmark and Info
      backCtx.fillStyle = textColor;
      backCtx.font = "bold 28px sans-serif";
      backCtx.textAlign = "center";
      backCtx.fillText("YEULUMIN AI", 256, 370);

      backCtx.fillStyle = subtextColor;
      backCtx.font = "14px monospace";
      backCtx.fillText("NEURAL PROTOCOL LABS", 256, 410);

      // Async load and render logo monogram
      const logoImg = new Image();
      logoImg.src = "/logos/trimmed_yeulumin ai-05.png";
      logoImg.onload = () => {
        const size = 120;
        backCtx.drawImage(logoImg, 256 - size / 2, 220 - size / 2, size, size);
        backTexture.needsUpdate = true;
      };
      backTexture.needsUpdate = true;
    };

    // Draw initial state
    const initialIsLight = typeof document !== "undefined" && document.documentElement.classList.contains("light");
    redrawBackCanvas(initialIsLight);

    // Watch for class changes on root element (theme change)
    const observer = new MutationObserver(() => {
      const isLight = document.documentElement.classList.contains("light");
      redrawBackCanvas(isLight);
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    const backMat = new THREE.MeshStandardMaterial({
      color: tColor,
      map: backTexture,
      roughness: 0.75,
      metalness: 0.05,
    });
    backMaterialRef.current = backMat;

    // T-Shirt Torso Geometry (Multi-material box)
    const torsoGeom = new THREE.BoxGeometry(1.2, 1.6, 0.16);
    
    // Create materials array for 6 sides of the torso box:
    // 0: Right, 1: Left, 2: Top, 3: Bottom, 4: Front, 5: Back
    const torsoMaterials = [
      defaultMat, // Right
      defaultMat, // Left
      defaultMat, // Top
      defaultMat, // Bottom
      frontMat,   // Front (maps AI design texture)
      backMat,    // Back (maps brand watermark)
    ];

    const torsoMesh = new THREE.Mesh(torsoGeom, torsoMaterials);
    torsoMesh.position.set(0, 0.2, 0);
    shirtGroup.add(torsoMesh);

    // Left Sleeve
    const leftSleeveGeom = new THREE.BoxGeometry(0.38, 0.45, 0.16);
    const leftSleeveMesh = new THREE.Mesh(leftSleeveGeom, defaultMat);
    leftSleeveMesh.position.set(-0.72, 0.7, 0);
    leftSleeveMesh.rotation.z = Math.PI / 6; // Angled down
    shirtGroup.add(leftSleeveMesh);

    // Right Sleeve
    const rightSleeveGeom = new THREE.BoxGeometry(0.38, 0.45, 0.16);
    const rightSleeveMesh = new THREE.Mesh(rightSleeveGeom, defaultMat);
    rightSleeveMesh.position.set(0.72, 0.7, 0);
    rightSleeveMesh.rotation.z = -Math.PI / 6; // Angled down
    shirtGroup.add(rightSleeveMesh);

    // Neck opening (tapered cylindrical neck cover)
    const neckGeom = new THREE.CylinderGeometry(0.24, 0.26, 0.1, 16);
    const neckMesh = new THREE.Mesh(neckGeom, defaultMat);
    neckMesh.position.set(0, 1.02, 0);
    shirtGroup.add(neckMesh);

    scene.add(shirtGroup);

    // 7. Mouse/Touch interactions
    const handleStart = (clientX: number, clientY: number) => {
      isDragging.current = true;
      previousMousePosition.current = { x: clientX, y: clientY };
    };

    const handleMove = (clientX: number, clientY: number) => {
      if (!isDragging.current || !shirtGroup) return;

      const deltaX = clientX - previousMousePosition.current.x;
      const deltaY = clientY - previousMousePosition.current.y;

      targetRotationY.current += deltaX * 0.008;
      targetRotationX.current = Math.max(
        -Math.PI / 6,
        Math.min(Math.PI / 6, targetRotationX.current + deltaY * 0.008)
      );

      previousMousePosition.current = { x: clientX, y: clientY };
    };

    const handleEnd = () => {
      isDragging.current = false;
    };

    // Canvas listeners
    const onMouseDown = (e: MouseEvent) => handleStart(e.clientX, e.clientY);
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onMouseUp = () => handleEnd();
    const onMouseLeave = () => handleEnd();

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        handleStart(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onTouchEnd = () => handleEnd();

    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("mouseleave", onMouseLeave);

    canvas.addEventListener("touchstart", onTouchStart);
    canvas.addEventListener("touchmove", onTouchMove);
    canvas.addEventListener("touchend", onTouchEnd);

    // 8. Animation Loop
    let animationFrameId: number;

    const animate = () => {
      // Smooth interpolation (Lerp) for rotation transitions
      currentRotationY.current += (targetRotationY.current - currentRotationY.current) * 0.1;
      currentRotationX.current += (targetRotationX.current - currentRotationX.current) * 0.1;

      if (shirtGroupRef.current) {
        shirtGroupRef.current.rotation.y = currentRotationY.current;
        shirtGroupRef.current.rotation.x = currentRotationX.current;
      }

      // Idle floating animation
      const elapsed = Date.now() * 0.001;
      if (shirtGroupRef.current) {
        shirtGroupRef.current.position.y = 0.2 + Math.sin(elapsed * 1.5) * 0.03;
      }

      // Idle slow rotating when not interacting
      if (!isDragging.current) {
        // Slowly drift rotation back to target Y if it was toggled
        targetRotationY.current += 0.002;
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // 9. Resize handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // Initial load texture if design exists on mount
    if (designImage) {
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(designImage, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        if (frontMaterialRef.current) {
          frontMaterialRef.current.map = texture;
          frontMaterialRef.current.needsUpdate = true;
        }
      });
    }

    // Cleanup
    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      
      canvas.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("mouseleave", onMouseLeave);

      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);

      // Dispose resources
      baseGeom.dispose();
      rodGeom.dispose();
      hangerHookGeom.dispose();
      hangerBarGeom.dispose();
      torsoGeom.dispose();
      leftSleeveGeom.dispose();
      rightSleeveGeom.dispose();
      neckGeom.dispose();

      metalMaterial.dispose();
      defaultMat.dispose();
      frontMat.dispose();
      backTexture.dispose();
      backMat.dispose();

      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[480px] bg-[#111111]/45 light:bg-white border border-neutral-800/80 light:border-zinc-200 rounded-2xl overflow-hidden backdrop-blur-xl flex items-center justify-center cursor-grab active:cursor-grabbing transition-colors duration-300"
    >
      {/* 3D Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Cybernetic overlay indicators */}
      <div className="absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-none select-none">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-neon light:bg-violet animate-pulse" />
          <span className="text-[10px] font-display uppercase tracking-widest text-neutral-400 light:text-zinc-500">
            Showroom Renderer v1.0
          </span>
        </div>
        <div className="text-[9px] text-neutral-500 light:text-zinc-400 font-mono">
          Drag to rotate • Pinch to zoom
        </div>
      </div>

      <div className="absolute top-4 right-4 text-[10px] font-mono bg-neutral-900/80 light:bg-zinc-100 border border-neutral-800 light:border-zinc-200 px-2 py-1 rounded text-neutral-400 light:text-zinc-700 pointer-events-none select-none">
        Active Base: <span style={{ color: shirtColor }}>{shirtColor.toUpperCase()}</span>
      </div>

      {/* Generating scanner visual overlay */}
      {isGenerating && (
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between">
          {/* Laser beam sliding down */}
          <div className="w-full h-[3px] bg-neon shadow-[0_0_15px_#00FFB2,0_0_30px_#00FFB2] absolute left-0 right-0 animate-[scan_2s_ease-in-out_infinite]" />
          <div className="absolute inset-0 bg-neon/[0.02] flex items-center justify-center">
            <div className="text-center bg-black/80 px-4 py-3 rounded-lg border border-neon/30 backdrop-blur-sm max-w-[80%]">
              <div className="text-xs font-display text-neon tracking-widest animate-pulse mb-1">
                WEAVING DESIGNS IN AI
              </div>
              <div className="text-[10px] font-mono text-neutral-400">
                Aligning neural vectors...
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Laser scanner keyframes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan {
          0%, 100% { top: 10%; }
          50% { top: 90%; }
        }
      `}} />
    </div>
  );
}
