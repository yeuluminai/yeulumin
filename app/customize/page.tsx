"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useViewerStore } from "@/components/viewer/useViewerStore";
import { useCartStore } from "../store/cartStore";
import { useAuth } from "../context/AuthContext";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { PRODUCTS, Product } from "../lib/products";
import {
  ArrowLeft,
  Sparkles,
  ShoppingBag,
  Heart,
  RotateCw,
  ZoomIn,
  RefreshCw,
  Eye,
  Sliders,
  Palette,
  Scissors,
  Move,
  Maximize2,
  Mic,
  Image as ImageIcon,
  Wand2,
  Check,
  Undo as UndoIcon,
  ChevronLeft,
  ChevronRight,
  FolderHeart
} from "lucide-react";
import GrainOverlay from "../components/GrainOverlay";

// Dynamically import 3D Viewer to disable SSR (Window and WebGL references)
const TshirtViewer = dynamic(() => import("@/components/viewer/TshirtViewer"), {
  ssr: false,
});

const COLOR_SWATCHES = [
  { name: "White", hex: "#ffffff" },
  { name: "Black", hex: "#1a1a1a" },
  { name: "Cream", hex: "#f5e6d3" },
  { name: "Grey", hex: "#9ca3af" },
  { name: "Red", hex: "#8B0000" },
  { name: "Forest", hex: "#2d5016" },
  { name: "Royal", hex: "#1d4ed8" },
  { name: "Purple", hex: "#6b21a8" },
  { name: "Orange", hex: "#ea580c" },
];

export default function DesignLabPage() {
  const { user } = useAuth();
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  // States from store
  const {
    color,
    design,
    view,
    size,
    quantity,
    customTextureUrl,
    customPrompt,
    decalScale,
    decalPosY,
    decalPosX,
    decalTarget,
    setColor,
    setDesign,
    setView,
    setSize,
    setQuantity,
    setCustomTextureUrl,
    setCustomPrompt,
    addToHistory,
    setDecalScale,
    setDecalPosY,
    setDecalPosX,
    setDecalTarget,
    resetDecalPlacement,
  } = useViewerStore();

  // Local state controls
  const [prompt, setPrompt] = useState("Create a cyberpunk wolf with neon blue accents.");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTool, setActiveTool] = useState<"color" | "garment" | "placement" | "size" | null>(null);
  const [selectedTag, setSelectedTag] = useState("Cyberpunk");
  const [autoRotate, setAutoRotate] = useState(true);
  const [zoomLevel, setZoomLevel] = useState("wide"); // wide, close
  const [wishlistSuccess, setWishlistSuccess] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);

  // Load preset or custom params on mount
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const presetId = searchParams.get("preset");
    if (presetId) {
      const product = PRODUCTS.find((p) => p.id === presetId);
      if (product) {
        if (product.defaultColor) setColor(product.defaultColor);
        if (product.image) {
          setCustomTextureUrl(product.image);
          setCustomPrompt(product.description);
          setDesign("ai");
        }
        if (product.defaultView) setView(product.defaultView);
        if (product.printPosition) setDecalTarget(product.printPosition);
      }
    }
  }, [setColor, setCustomTextureUrl, setCustomPrompt, setDesign, setView, setDecalTarget]);

  // Synthesis generator using Stability AI
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);

    try {
      const fullPrompt = `${prompt}, styled as a modern graphic design print decal, ${selectedTag.toLowerCase()} style, centered, high quality, vector graphic, isolated white background`;
      
      const response = await fetch("/api/stability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: fullPrompt }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to generate design");
      }

      setCustomTextureUrl(data.image);
      setCustomPrompt(prompt);
      addToHistory(data.image);
      setDesign("ai");
    } catch (err) {
      console.error("AI Generation failed:", err);
      alert("Failed to synthesize design textures. Proceeding with default assets.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Add custom design to shopping cart
  const handleAddToCart = () => {
    if (!user) {
      router.push(`/auth?redirect=/customize`);
      return;
    }

    setCartSuccess(true);
    addItem({
      id: `custom-lab-${Date.now()}`,
      name: `Custom ${selectedTag} Tee`,
      description: prompt || "Bespoke customized streetwear garment.",
      price: 999,
      quantity: 1,
      size: size,
      color: color,
      image: customTextureUrl || "/tshirt-blank.png",
      style: selectedTag,
    });

    setTimeout(() => setCartSuccess(false), 2500);
  };

  // Save custom design configuration to DB collection
  const handleSaveToCollection = async () => {
    if (!user) {
      router.push(`/auth?redirect=/customize`);
      return;
    }

    if (!isSupabaseConfigured()) {
      alert("Supabase is not configured.");
      return;
    }

    setWishlistSuccess(true);

    try {
      const { error } = await supabase.from("customizations").insert({
        user_id: user.id,
        name: `Bespoke ${selectedTag} Tee`,
        description: prompt || "Bespoke customized streetwear garment.",
        color,
        design: selectedTag.toLowerCase(),
        custom_texture_url: customTextureUrl,
        custom_prompt: prompt,
        decal_scale: decalScale,
        decal_pos_x: decalPosX,
        decal_pos_y: decalPosY,
        decal_target: decalTarget,
      });

      if (error) throw error;
      setTimeout(() => setWishlistSuccess(false), 2500);
    } catch (err) {
      console.error("Save design failed:", err);
      alert("Failed to save customization to collection.");
      setWishlistSuccess(false);
    }
  };

  // Preset Card handler
  const handleApplyPreset = (product: Product) => {
    if (product.defaultColor) setColor(product.defaultColor);
    if (product.image) {
      setCustomTextureUrl(product.image);
      setCustomPrompt(product.description);
      setDesign("ai");
    }
    if (product.defaultView) setView(product.defaultView);
    if (product.printPosition) setDecalTarget(product.printPosition);
  };

  const isPresetActive = (product: Product) => {
    return customTextureUrl === product.image;
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-[#F5F6F8] text-[#0A0A0A] overflow-x-hidden antialiased">
      <GrainOverlay />

      {/* ─── DESIGN LAB HEADER TOP BAR ─── */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between z-20">
        <button
          onClick={() => router.back()}
          className="h-10 w-10 rounded-full bg-white border border-neutral-200 shadow-sm flex items-center justify-center hover:bg-neutral-50 transition-colors cursor-pointer"
          title="Back"
        >
          <ArrowLeft className="h-5 w-5 text-neutral-800" />
        </button>

        {/* Logo and title */}
        <div className="flex items-center gap-1.5">
          <img
            src="/logos/trimmed_yeulumin ai-05.png"
            alt="Yeulumin AI Logo"
            className="h-7 w-7 object-contain"
          />
          <span className="font-sans font-black text-base uppercase tracking-wider text-neutral-900">
            Yeulumin Ai
          </span>
        </div>

        {/* Right Save action pill */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveToCollection}
            className="p-2.5 rounded-full bg-white border border-neutral-200 text-neutral-500 hover:text-red-500 shadow-sm transition-colors cursor-pointer flex items-center justify-center"
            title="Save to Collection"
          >
            <FolderHeart className={`h-4.5 w-4.5 ${wishlistSuccess ? "text-red-500 fill-current" : ""}`} />
          </button>
        </div>
      </header>

      {/* ─── MAIN WORKSPACE CONTENT ─── */}
      <main className="flex-grow flex flex-col items-center justify-center relative select-none w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 gap-6">
        
        {/* 3D MANNEQUIN SHOWROOM STAGE */}
        <div className="w-full max-w-2xl h-[400px] md:h-[450px] relative flex items-center justify-center">
          
          {/* Orbital blue glow ring behind t-shirt mesh */}
          <div className="absolute inset-0 m-auto w-[18rem] h-[18rem] sm:w-[22rem] sm:h-[22rem] md:w-[28rem] md:h-[28rem] rounded-full border border-blue-500/10 bg-transparent flex items-center justify-center pointer-events-none select-none z-0">
            <div className="w-[16rem] h-[16rem] sm:w-[20rem] sm:h-[20rem] md:w-[26rem] md:h-[26rem] rounded-full border border-blue-400/20 blur-[8px] animate-pulse" />
          </div>

          {/* Three.js interactive model canvas */}
          <div className="absolute inset-0 z-10">
            <TshirtViewer
              scale={1.3}
              autoRotateSpeed={autoRotate ? 2.0 : 0}
              cameraDistance={zoomLevel === "close" ? 2.8 : 4.2}
            />
          </div>

          {/* LEFT VERTICAL FLOATING CAMERA CONTROL MODULE */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2">
            
            {/* View eye-badge header */}
            <div className="bg-blue-600 text-white rounded-t-xl px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20">
              <Eye className="h-3.5 w-3.5" />
              <span>View</span>
            </div>

            {/* Controller card list */}
            <div className="bg-white border border-neutral-200/80 rounded-b-xl p-2.5 flex flex-col gap-3 shadow-md">
              <button
                onClick={() => setAutoRotate(!autoRotate)}
                className={`flex flex-col items-center justify-center gap-1 p-1.5 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer ${
                  autoRotate ? "text-blue-600 font-bold" : "text-neutral-500"
                }`}
                title="Toggle Rotation"
              >
                <RefreshCw className={`h-4.5 w-4.5 ${autoRotate ? "animate-spin-slow" : ""}`} />
                <span className="text-[8px] font-mono uppercase tracking-wider">Rotate</span>
              </button>

              <button
                onClick={() => setZoomLevel(zoomLevel === "wide" ? "close" : "wide")}
                className={`flex flex-col items-center justify-center gap-1 p-1.5 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer ${
                  zoomLevel === "close" ? "text-blue-600 font-bold" : "text-neutral-500"
                }`}
                title="Toggle Zoom"
              >
                <ZoomIn className="h-4.5 w-4.5" />
                <span className="text-[8px] font-mono uppercase tracking-wider">Zoom</span>
              </button>

              <button
                onClick={() => {
                  setColor("#ffffff");
                  setCustomTextureUrl(null);
                  setDesign("none");
                  resetDecalPlacement();
                  setAutoRotate(true);
                  setZoomLevel("wide");
                }}
                className="flex flex-col items-center justify-center gap-1 p-1.5 rounded-lg hover:bg-neutral-50 transition-colors text-neutral-500 cursor-pointer"
                title="Reset Workspace"
              >
                <Maximize2 className="h-4.5 w-4.5" />
                <span className="text-[8px] font-mono uppercase tracking-wider">Reset</span>
              </button>
            </div>

          </div>

        </div>

        {/* ─── AI GENERATOR INPUT CONSOLE (FLOATING CARD) ─── */}
        <section className="w-full max-w-xl bg-white border border-neutral-200/80 rounded-3xl p-5 shadow-lg z-20 flex flex-col gap-4 relative">
          
          {/* Prompt text area */}
          <div className="flex flex-col gap-1.5 text-left">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-700">
              <Sparkles className="h-4 w-4 text-blue-600 animate-pulse" />
              <span>Create with Neural Art synthesis</span>
            </div>
            
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
              placeholder="Describe your graphic ideas... e.g. A cybernetic dragon in red & blue neon..."
              className="w-full mt-1 bg-transparent text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none resize-none h-16 leading-relaxed"
            />
          </div>

          {/* Lower controls bar */}
          <div className="flex items-center justify-between border-t border-neutral-100 pt-3">
            
            {/* Input helpers */}
            <div className="flex items-center gap-1.5 text-neutral-400">
              <button
                type="button"
                className="p-2 rounded-full hover:bg-neutral-50 hover:text-neutral-700 transition-colors cursor-pointer"
                title="Voice Input"
              >
                <Mic className="h-4.5 w-4.5" />
              </button>
              <button
                type="button"
                className="p-2 rounded-full hover:bg-neutral-50 hover:text-neutral-700 transition-colors cursor-pointer"
                title="Upload Reference Image"
              >
                <ImageIcon className="h-4.5 w-4.5" />
              </button>
              <button
                type="button"
                className="p-2 rounded-full hover:bg-neutral-50 hover:text-neutral-700 transition-colors cursor-pointer"
                title="Refine Prompt"
              >
                <Wand2 className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Synthesizer Generate button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow hover:shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40"
            >
              <Sparkles className="h-3.5 w-3.5 fill-current" />
              <span>{isGenerating ? "Synthesizing..." : "Generate"}</span>
            </button>

          </div>

        </section>

        {/* ─── EXPANDABLE DRAWER OVERLAY FOR TOOLS ─── */}
        {activeTool && (
          <div className="w-full max-w-xl bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-md z-20 flex flex-col gap-4 animate-fadeIn">
            
            {/* COLOR DRAWER */}
            {activeTool === "color" && (
              <div className="flex flex-col gap-3 text-left">
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest font-bold">
                  Select Fabric Color
                </span>
                <div className="flex flex-wrap gap-3">
                  {COLOR_SWATCHES.map((swatch) => {
                    const isActive = color.toLowerCase() === swatch.hex.toLowerCase();
                    return (
                      <button
                        key={swatch.name}
                        onClick={() => setColor(swatch.hex)}
                        className={`h-9 w-9 rounded-full border-2 cursor-pointer transition-all duration-200 flex items-center justify-center ${
                          isActive
                            ? "border-blue-600 scale-108 shadow-md"
                            : "border-neutral-200 hover:scale-105"
                        }`}
                        style={{ backgroundColor: swatch.hex }}
                        title={swatch.name}
                      >
                        {isActive && <Check className={`h-4.5 w-4.5 ${swatch.hex === "#ffffff" ? "text-black" : "text-white"}`} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* GARMENT SELECTOR DRAWER */}
            {activeTool === "garment" && (
              <div className="flex flex-col gap-4 text-left">
                
                {/* Print Placement Front vs Back */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest font-bold">
                    Decal target placement
                  </span>
                  <div className="flex bg-neutral-100 p-1 rounded-xl border border-neutral-200 max-w-[200px]">
                    {(["front", "back"] as const).map((target) => {
                      const isActive = decalTarget === target;
                      return (
                        <button
                          key={target}
                          onClick={() => {
                            setDecalTarget(target);
                            setView(target);
                          }}
                          className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded-lg cursor-pointer transition-all ${
                            isActive ? "bg-white text-black shadow-sm" : "text-neutral-500 hover:text-neutral-800"
                          }`}
                        >
                          {target}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Size Swatch Picker */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest font-bold">
                    Select Fit size
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {["XS", "S", "M", "L", "XL", "XXL"].map((sz) => {
                      const isActive = size === sz;
                      return (
                        <button
                          key={sz}
                          onClick={() => setSize(sz as any)}
                          className={`h-8 w-12 text-[10px] font-bold rounded-lg border flex items-center justify-center cursor-pointer transition-all ${
                            isActive
                              ? "bg-black border-black text-white"
                              : "bg-white border-neutral-200 text-neutral-600 hover:border-neutral-400"
                          }`}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

            {/* PLACEMENT SLIDERS DRAWER */}
            {activeTool === "placement" && (
              <div className="flex flex-col gap-4 text-left">
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest font-bold">
                  Shift design positioning
                </span>
                
                {/* Horizontal slide */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-[9px] font-mono text-neutral-500 uppercase tracking-wider">
                    <span>Horizontal offset</span>
                    <span>{(decalPosX * 100).toFixed(0)}px</span>
                  </div>
                  <input
                    type="range"
                    min="-0.1"
                    max="0.1"
                    step="0.01"
                    value={decalPosX}
                    onChange={(e) => setDecalPosX(parseFloat(e.target.value))}
                    className="w-full accent-blue-600 h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Vertical slide */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-[9px] font-mono text-neutral-500 uppercase tracking-wider">
                    <span>Vertical offset</span>
                    <span>{(decalPosY * 100).toFixed(0)}px</span>
                  </div>
                  <input
                    type="range"
                    min="-0.1"
                    max="0.2"
                    step="0.01"
                    value={decalPosY}
                    onChange={(e) => setDecalPosY(parseFloat(e.target.value))}
                    className="w-full accent-blue-600 h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

              </div>
            )}

            {/* SCALE SIZE DRAWER */}
            {activeTool === "size" && (
              <div className="flex flex-col gap-3 text-left">
                <div className="flex justify-between text-[10px] font-mono text-neutral-400 uppercase tracking-widest font-bold">
                  <span>Decal print scale</span>
                  <span className="text-neutral-700">{(decalScale * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.6"
                  step="0.01"
                  value={decalScale}
                  onChange={(e) => setDecalScale(parseFloat(e.target.value))}
                  className="w-full accent-blue-600 h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            )}

          </div>
        )}

        {/* ─── GARMENT STYLING TOOLS (PILLS BAR) ─── */}
        <section className="w-full max-w-xl bg-white border border-neutral-200/80 rounded-2xl px-5 py-3 shadow-md z-20 flex justify-around items-center">
          
          <button
            onClick={() => setActiveTool(activeTool === "color" ? null : "color")}
            className={`flex flex-col items-center gap-1 text-neutral-400 hover:text-neutral-800 transition-colors cursor-pointer ${
              activeTool === "color" ? "text-blue-600 font-semibold" : ""
            }`}
          >
            <Palette className="h-5 w-5" />
            <span className="text-[9px] uppercase font-bold tracking-wider">Color</span>
          </button>

          <button
            onClick={() => setActiveTool(activeTool === "garment" ? null : "garment")}
            className={`flex flex-col items-center gap-1 text-neutral-400 hover:text-neutral-800 transition-colors cursor-pointer ${
              activeTool === "garment" ? "text-blue-600 font-semibold" : ""
            }`}
          >
            <Scissors className="h-5 w-5" />
            <span className="text-[9px] uppercase font-bold tracking-wider">Garment</span>
          </button>

          <button
            onClick={() => setActiveTool(activeTool === "placement" ? null : "placement")}
            className={`flex flex-col items-center gap-1 text-neutral-400 hover:text-neutral-800 transition-colors cursor-pointer ${
              activeTool === "placement" ? "text-blue-600 font-semibold" : ""
            }`}
          >
            <Move className="h-5 w-5" />
            <span className="text-[9px] uppercase font-bold tracking-wider">Placement</span>
          </button>

          <button
            onClick={() => setActiveTool(activeTool === "size" ? null : "size")}
            className={`flex flex-col items-center gap-1 text-neutral-400 hover:text-neutral-800 transition-colors cursor-pointer ${
              activeTool === "size" ? "text-blue-600 font-semibold" : ""
            }`}
          >
            <Maximize2 className="h-5 w-5" />
            <span className="text-[9px] uppercase font-bold tracking-wider">Size</span>
          </button>

          <button
            onClick={() => {
              resetDecalPlacement();
              setActiveTool(null);
            }}
            className="flex flex-col items-center gap-1 text-neutral-400 hover:text-neutral-800 transition-colors cursor-pointer"
          >
            <UndoIcon className="h-5 w-5" />
            <span className="text-[9px] uppercase font-bold tracking-wider">Undo</span>
          </button>

        </section>

        {/* Add to Cart CTA Button */}
        <div className="w-full max-w-xl z-20">
          <button
            onClick={handleAddToCart}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-lg shadow-blue-500/20 hover:scale-101 active:scale-99 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <ShoppingBag className="h-4.5 w-4.5" />
            <span>{cartSuccess ? "Added to Cart!" : "Add to Cart (₹999)"}</span>
          </button>
        </div>

        {/* ─── STYLES FOR YOU (TEMPLATE SELECTOR CAROUSEL) ─── */}
        <section className="w-full my-8 text-left">
          
          <div className="flex items-center gap-2 mb-6">
            <h2 className="font-display text-lg font-black uppercase tracking-wider text-neutral-900">
              Styles for you
            </h2>
            <div className="h-[2px] w-8 bg-neutral-900" />
          </div>

          {/* Filter Pills Category bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none w-full mb-6">
            <button
              onClick={() => setSelectedTag("Cyberpunk")}
              className={`text-xs font-semibold px-4 py-2 rounded-full border transition-all duration-200 uppercase tracking-widest whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                selectedTag === "Cyberpunk"
                  ? "bg-blue-50 border-blue-500 text-blue-600 font-bold shadow-sm"
                  : "bg-white border-neutral-200 text-neutral-500 hover:border-neutral-400 hover:text-black"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 fill-current" />
              <span>Cyberpunk</span>
            </button>
            
            {["Anime", "Gym", "Minimal", "Luxury", "Streetwear", "Typography", "Vintage"].map((tag) => {
              const isActive = selectedTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`text-xs font-semibold px-4 py-2 rounded-full border transition-all duration-200 uppercase tracking-widest whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-blue-50 border-blue-500 text-blue-600 font-bold shadow-sm"
                      : "bg-white border-neutral-200 text-neutral-500 hover:border-neutral-400 hover:text-black"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          {/* Horizontal Preset Carousel Cards */}
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-none w-full snap-x snap-mandatory">
            {PRODUCTS.map((prod, idx) => {
              const active = isPresetActive(prod);
              return (
                <div
                  key={prod.id}
                  onClick={() => handleApplyPreset(prod)}
                  className={`flex-shrink-0 w-[180px] snap-start bg-white border rounded-2xl overflow-hidden group flex flex-col justify-between transition-all duration-300 shadow-sm cursor-pointer hover:shadow-md ${
                    active ? "border-blue-500 ring-1 ring-blue-500/30" : "border-neutral-200/80"
                  }`}
                >
                  {/* Preset Image */}
                  <div className="relative aspect-square w-full bg-[#F9FAFB] flex items-center justify-center p-3">
                    
                    {/* Active checkmark indicator */}
                    {active && (
                      <div className="absolute top-2.5 right-2.5 z-10 h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md animate-scaleIn">
                        <Check className="h-3 w-3 font-bold" />
                      </div>
                    )}

                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>

                  {/* Preset Label info */}
                  <div className="p-3 text-left border-t border-neutral-50">
                    <h3 className="font-bold text-neutral-800 text-xs truncate">
                      {prod.name}
                    </h3>
                    <span className="text-[9px] text-neutral-400 font-mono block mt-0.5">
                      Version {idx + 1}
                    </span>
                  </div>

                  {/* Active bottom ribbon */}
                  {active && (
                    <div className="w-full py-1 bg-blue-600 text-white text-[8px] font-mono font-bold text-center uppercase tracking-widest shadow-inner">
                      Applied to design
                    </div>
                  )}

                </div>
              );
            })}
          </div>

        </section>

      </main>

    </div>
  );
}
