"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Sparkles, ShoppingBag, RotateCcw, ShieldCheck, ChevronRight, ChevronLeft, Plus, Minus } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import GrainOverlay from "../components/GrainOverlay";
import ThreeMannequin from "../components/ThreeMannequin";
import { PRODUCTS } from "../lib/products";
import { useCartStore } from "../store/cartStore";

// Color options mapping
const COLOR_PALETTE = [
  { name: "Carbon Black", hex: "#0F0F0F" },
  { name: "Digital White", hex: "#EBEBEB" },
  { name: "Cyber Mint", hex: "#00FFB2" },
  { name: "Phantom Violet", hex: "#7B2FFF" },
  { name: "Cobalt Blue", hex: "#0047FF" },
];

const STYLE_PRESETS = [
  { name: "Abstract", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80" },
  { name: "Minimal", image: "https://images.unsplash.com/photo-1618005198143-e5283b519a7f?w=600&auto=format&fit=crop&q=80" },
  { name: "Illustrative", image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80" },
  { name: "Typographic", image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80" },
  { name: "Vintage", image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=600&auto=format&fit=crop&q=80" },
  { name: "Futuristic", image: "https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80" },
];

function CustomizeStudio() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  // States
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("Futuristic");
  const [selectedColor, setSelectedColor] = useState(COLOR_PALETTE[0]);
  const [selectedSize, setSelectedSize] = useState<"XS" | "S" | "M" | "L" | "XL" | "XXL">("M");
  const [quantity, setQuantity] = useState(1);
  const [view, setView] = useState<"front" | "back">("front");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(STYLE_PRESETS[5].image); // Default is Futuristic
  const [notification, setNotification] = useState<string | null>(null);

  // Detect preset in URL search params
  useEffect(() => {
    const presetId = searchParams.get("preset");
    if (presetId) {
      const presetProd = PRODUCTS.find((p) => p.id === presetId);
      if (presetProd) {
        setPrompt(`Remix of preset "${presetProd.name}": cyberpunk vector layout.`);
        setGeneratedImage(presetProd.image);
        // Find style matching category
        const styleMatch = STYLE_PRESETS.find(
          (s) => s.name.toLowerCase() === presetProd.category.toLowerCase()
        );
        if (styleMatch) setSelectedStyle(styleMatch.name);
      }
    }
  }, [searchParams]);

  // Handle generation action
  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    // Simulate compilation time
    setTimeout(() => {
      // Find style layout image, fallback to random
      const matchedStyle = STYLE_PRESETS.find(
        (s) => s.name.toLowerCase() === selectedStyle.toLowerCase()
      );
      if (matchedStyle) {
        setGeneratedImage(matchedStyle.image);
      }
      setIsGenerating(false);
      
      // Auto-trigger a success flash
      setNotification("AI compilation complete: Texture mapped.");
      setTimeout(() => setNotification(null), 3500);
    }, 2500);
  };

  // Add customized item to cart
  const handleAddToCart = () => {
    const isCustom = prompt.trim().length > 0;
    const itemToAdd = {
      id: `custom-${Date.now()}`,
      name: isCustom ? `Custom ${selectedStyle} Tee` : `Procedural Tee`,
      description: isCustom 
        ? `AI prompt: "${prompt.slice(0, 45)}${prompt.length > 45 ? '...' : ''}"` 
        : `Yeulumin AI generative ${selectedStyle} blueprint.`,
      price: 2199, // Custom designs premium rate
      image: generatedImage || STYLE_PRESETS[0].image,
      size: selectedSize,
      color: selectedColor.hex,
      prompt: prompt || `Yeulumin AI ${selectedStyle} prompt`,
      style: selectedStyle,
    };

    addItem(itemToAdd);
    
    // Alert or redirect
    setNotification("Design loaded into Cart module.");
    setTimeout(() => {
      setNotification(null);
      router.push("/cart");
    }, 1000);
  };

  return (
    <main className="flex-grow mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {notification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#0A0A0A] light:bg-white border border-neon light:border-violet text-neon light:text-violet text-xs px-6 py-3 rounded-lg shadow-[0_0_15px_rgba(0,255,178,0.2)] light:shadow-[0_0_15px_rgba(123,47,255,0.15)] font-mono animate-bounce">
          {notification}
        </div>
      )}

      {/* Grid Split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
        
        {/* LEFT PANEL - PROMPT STUDIO (7 columns) */}
        <div className="lg:col-span-6 flex flex-col gap-6 md:gap-8 bg-[#111111]/20 light:bg-white border border-neutral-900 light:border-zinc-200 rounded-2xl p-6 sm:p-8 backdrop-blur-md transition-colors duration-300">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-mono text-neon light:text-violet uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" /> Custom Studio
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-white light:text-zinc-900">
              DESIGN WITH AI
            </h1>
            <div className="h-[2px] w-12 bg-neon mt-1" />
          </div>

          <form onSubmit={handleGenerate} className="flex flex-col gap-6">
            
            {/* Prompt input */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 light:text-zinc-555 font-mono">
                Describe Your Design Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A chrome dragon wrapped around computer cables, glowing cybermint and purple hues, techwear layout..."
                required
                rows={4}
                className="w-full bg-[#111111] light:bg-zinc-50 border border-neutral-800 light:border-zinc-200 focus:border-neon light:focus:border-violet focus:ring-1 focus:ring-neon light:focus:ring-violet rounded-xl p-4 text-xs text-neutral-300 light:text-zinc-900 placeholder-neutral-600 light:placeholder-zinc-400 focus:outline-none transition-all leading-relaxed"
              />
            </div>

            {/* Style Selector */}
            <div className="flex flex-col gap-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 light:text-zinc-555 font-mono">
                Aesthetic Matrix style
              </label>
              <div className="grid grid-cols-3 gap-2">
                {STYLE_PRESETS.map((style) => {
                  const isActive = selectedStyle === style.name;
                  return (
                    <button
                      key={style.name}
                      type="button"
                      onClick={() => setSelectedStyle(style.name)}
                      className={`py-2 px-1 text-center text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all cursor-pointer ${
                        isActive
                          ? "bg-neon border-neon text-[#0A0A0A] light:bg-violet light:border-violet light:text-white glow-neon light:glow-violet"
                          : "bg-neutral-950/40 light:bg-zinc-100 border-neutral-900 light:border-zinc-200 text-neutral-500 light:text-zinc-550 hover:border-neutral-800 light:hover:border-zinc-300 hover:text-neutral-300 light:hover:text-zinc-800"
                      }`}
                    >
                      {style.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Palette Picker */}
            <div className="flex flex-col gap-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 light:text-zinc-555 font-mono">
                T-Shirt Fabric Color
              </label>
              <div className="flex flex-wrap items-center gap-3">
                {COLOR_PALETTE.map((color) => {
                  const isActive = selectedColor.hex === color.hex;
                  return (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      style={{ backgroundColor: color.hex }}
                      className={`h-8 w-8 rounded-full border relative flex items-center justify-center transition-all cursor-pointer ${
                        isActive
                          ? "scale-110 ring-2 ring-neon/60 border-white"
                          : "border-neutral-900 hover:scale-105"
                      }`}
                      title={color.name}
                    >
                      {isActive && (
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            color.hex === "#EBEBEB" ? "bg-black" : "bg-white"
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
                <span className="text-[10px] font-mono text-neutral-500 ml-2">
                  Active: {selectedColor.name}
                </span>
              </div>
            </div>

            {/* Size & Qty Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              
              {/* Size Select */}
              <div className="flex flex-col gap-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 light:text-zinc-555 font-mono">
                  Sizing Matrix
                </label>
                <div className="flex items-center gap-1.5">
                  {(["XS", "S", "M", "L", "XL", "XXL"] as const).map((size) => {
                    const isActive = selectedSize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`h-8 w-8 text-[10px] font-bold rounded border flex items-center justify-center transition-all cursor-pointer ${
                          isActive
                            ? "bg-neon border-neon text-[#0A0A0A] light:bg-violet light:border-violet light:text-white glow-neon light:glow-violet font-black"
                            : "bg-neutral-950/40 light:bg-zinc-100 border-neutral-900 light:border-zinc-200 text-neutral-500 light:text-zinc-500 hover:border-neutral-800 light:hover:border-zinc-300 hover:text-neutral-300 light:hover:text-zinc-800"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity Stepper */}
              <div className="flex flex-col gap-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 light:text-zinc-555 font-mono">
                  Quantity Units
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-neutral-950/50 light:bg-zinc-100 border border-neutral-900 light:border-zinc-200 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 text-neutral-500 hover:text-neon light:hover:text-violet transition-colors cursor-pointer"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-12 text-center text-xs font-mono font-bold text-neutral-200 light:text-zinc-800">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 text-neutral-500 hover:text-neon light:hover:text-violet transition-colors cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Generate Trigger */}
            <button
              type="submit"
              disabled={isGenerating}
              className={`w-full py-4 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                isGenerating
                  ? "bg-neutral-900 border border-neutral-800 text-neutral-500 cursor-not-allowed"
                  : "bg-neon text-[#0A0A0A] hover:bg-[#00e6a0] glow-neon font-display text-sm"
              }`}
            >
              <Sparkles className="h-4 w-4 fill-current animate-pulse" />
              <span>{isGenerating ? "Compiling Matrix..." : "Generate Design →"}</span>
            </button>

          </form>

          {/* Generated Result Preview Block */}
          <div className="border border-neutral-900 light:border-zinc-200 bg-[#0A0A0A]/40 light:bg-zinc-50 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-center transition-colors">
            <div className="h-24 w-24 rounded-lg bg-neutral-950 border border-neutral-950 overflow-hidden flex-shrink-0 relative">
              {generatedImage ? (
                <img
                  src={generatedImage}
                  alt="AI Generated Texture"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-neutral-950 border border-neutral-900 light:border-zinc-200">
                  <span className="text-[10px] font-mono text-neutral-700">VOID</span>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1 text-center sm:text-left">
              <span className="text-[10px] font-mono text-neutral-500 light:text-zinc-500">
                ACTIVE TEXTURE MAP
              </span>
              <h4 className="text-xs font-bold text-neutral-200 light:text-zinc-800">
                {isGenerating ? "Synthesizing vector coordinates..." : `${selectedStyle} Style Overlay`}
              </h4>
              <p className="text-[10px] text-neutral-600 light:text-zinc-500 leading-relaxed max-w-xs">
                {isGenerating 
                  ? "Resolving style weights against custom prompt prompts." 
                  : "Texture compiles automatically onto the active 3D mannequin showroom model."}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - 3D SHOWROOM (5 columns) */}
        <div className="lg:col-span-6 flex flex-col gap-6 sticky top-28">
          
          {/* 3D Mannequin Canvas Container */}
          <ThreeMannequin
            shirtColor={selectedColor.hex}
            designImage={generatedImage}
            view={view}
            isGenerating={isGenerating}
          />

          {/* View Toggles & Actions */}
          <div className="flex flex-col gap-4">
            
            {/* View Rotation buttons */}
            <div className="flex justify-center items-center gap-3">
              <button
                type="button"
                onClick={() => setView("front")}
                className={`flex-grow py-2.5 text-xs font-semibold rounded-lg border uppercase tracking-wider transition-colors cursor-pointer ${
                  view === "front"
                    ? "bg-[#111111] light:bg-zinc-100 border-neon light:border-violet text-neon light:text-violet glow-text-neon font-black"
                    : "bg-[#111111]/45 light:bg-white border-neutral-900 light:border-zinc-200 text-neutral-500 light:text-zinc-550 hover:text-neutral-300 light:hover:text-zinc-900"
                }`}
              >
                Front Showroom
              </button>
              <button
                type="button"
                onClick={() => setView("back")}
                className={`flex-grow py-2.5 text-xs font-semibold rounded-lg border uppercase tracking-wider transition-colors cursor-pointer ${
                  view === "back"
                    ? "bg-[#111111] light:bg-zinc-100 border-neon light:border-violet text-neon light:text-violet glow-text-neon font-black"
                    : "bg-[#111111]/45 light:bg-white border-neutral-900 light:border-zinc-200 text-neutral-500 light:text-zinc-550 hover:text-neutral-300 light:hover:text-zinc-900"
                }`}
              >
                Back Showroom
              </button>
            </div>

            {/* Quality Seals */}
            <div className="grid grid-cols-2 gap-4 border-y border-neutral-900 light:border-zinc-200 py-4 font-mono text-[10px] text-neutral-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-neon light:text-violet" />
                <span>Heavyweight 280GSM Cotton</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-violet" />
                <span>Free Custom Replacements</span>
              </div>
            </div>

            {/* Dynamic Add to Cart CTA */}
            <button
              onClick={handleAddToCart}
              disabled={isGenerating}
              className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                isGenerating
                  ? "bg-neutral-900 text-neutral-600 border border-neutral-950 cursor-not-allowed"
                  : "bg-violet text-white hover:bg-[#8d47ff] glow-violet font-display"
              }`}
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Add Custom Shirt to Cart • ₹2,199</span>
            </button>

          </div>
        </div>

      </div>
    </main>
  );
}

function CustomizeLoading() {
  return (
    <div className="flex-grow flex items-center justify-center min-h-[400px]">
      <div className="text-center font-mono">
        <div className="h-8 w-8 border-2 border-neon border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-neutral-500 uppercase tracking-widest">
          Synchronizing customize matrix...
        </p>
      </div>
    </div>
  );
}

export default function CustomizePage() {
  return (
    <div className="relative min-h-screen flex flex-col bg-[#0A0A0A] light:bg-[#FAFAFA] text-[#f5f5f5] light:text-[#0A0A0A] transition-colors duration-300">
      <GrainOverlay />
      <Navbar />
      <Suspense fallback={<CustomizeLoading />}>
        <CustomizeStudio />
      </Suspense>
      <Footer />
    </div>
  );
}
