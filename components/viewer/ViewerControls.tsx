"use client";

import React, { useState } from "react";
import { useViewerStore, DesignType, ViewType, SizeType } from "./useViewerStore";
import { useCartStore } from "@/app/store/cartStore";
import { ShoppingBag, Plus, Minus, FolderHeart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { supabase, isSupabaseConfigured } from "@/app/lib/supabase";

const COLOR_SWATCHES = [
  { name: "White", hex: "#ffffff" },
  { name: "Black", hex: "#1a1a1a" },
  { name: "Navy", hex: "#1a3a5c" },
  { name: "Red", hex: "#8B0000" },
  { name: "Forest", hex: "#2d5016" },
  { name: "Brown", hex: "#5c3a1a" },
  { name: "Purple", hex: "#4a2c6e" },
  { name: "Teal", hex: "#1a5c5c" },
  { name: "Olive", hex: "#5c5c1a" },
  { name: "Tan", hex: "#8c6914" },
];

const DESIGNS = [
  { id: "none" as DesignType, icon: "⬜", label: "Plain" },
  { id: "logo" as DesignType, icon: "✦", label: "Logo" },
  { id: "abstract" as DesignType, icon: "◈", label: "Abstract" },
  { id: "stripe" as DesignType, icon: "≡", label: "Stripes" },
  { id: "circuit" as DesignType, icon: "⌗", label: "Circuit" },
  { id: "ai" as DesignType, icon: "◉", label: "AI Gen" },
];

const VIEWS = [
  { id: "front" as ViewType, label: "Front" },
  { id: "back" as ViewType, label: "Back" },
  { id: "side" as ViewType, label: "Side" },
];

const SIZES: SizeType[] = ["XS", "S", "M", "L", "XL", "XXL"];

export default function ViewerControls() {
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
    setDecalScale,
    setDecalPosY,
    setDecalPosX,
    setDecalTarget,
    resetDecalPlacement,
  } = useViewerStore();

  const addItem = useCartStore((state) => state.addItem);
  const [addingToCart, setAddingToCart] = useState(false);
  
  const { user } = useAuth();
  const router = useRouter();

  const [savingToCollection, setSavingToCollection] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveToCollection = async () => {
    if (!user) {
      const currentPath = window.location.pathname + window.location.search;
      router.push(`/auth?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    if (!isSupabaseConfigured()) {
      alert("Supabase configuration not found. Check environment variables.");
      return;
    }

    setSavingToCollection(true);
    setSaveSuccess(false);

    try {
      const designLabel = DESIGNS.find((d) => d.id === design)?.label || "Plain";
      const name = prompt("Name your custom creation:", `Custom ${designLabel} Tee`) || `Custom ${designLabel} Tee`;

      const { error } = await supabase.from("customizations").insert({
        user_id: user.id,
        name,
        description: customPrompt || `A bespoke 3D customized t-shirt with ${designLabel} styling.`,
        color,
        design,
        custom_texture_url: (design === "ai" && customTextureUrl) ? customTextureUrl : null,
        custom_prompt: customPrompt,
        decal_scale: decalScale,
        decal_pos_x: decalPosX,
        decal_pos_y: decalPosY,
        decal_target: decalTarget,
      });

      if (error) throw error;
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save customization to your collection.");
    } finally {
      setSavingToCollection(false);
    }
  };

  const handleAddToCart = () => {
    if (!user) {
      const currentPath = window.location.pathname + window.location.search;
      router.push(`/auth?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    setAddingToCart(true);

    // Create a representation image/label based on color/design
    const designLabel = DESIGNS.find((d) => d.id === design)?.label || "Plain";
    const colorLabel = COLOR_SWATCHES.find((c) => c.hex === color)?.name || "Custom";

    // Use generated Stability AI design if applicable, else fallback
    const cartImage = (design === "ai" && customTextureUrl)
      ? customTextureUrl
      : `/logos/trimmed_yeulumin ai-05.png`;

    const description = (design === "ai" && customTextureUrl)
      ? `${colorLabel} fabric style, size ${size}. Customized via Gemini AI (Scale: ${(decalScale * 100).toFixed(0)}%, Position Y: ${decalPosY.toFixed(2)}).`
      : `${colorLabel} fabric style, size ${size}. Procedural 3D studio layout (Scale: ${(decalScale * 100).toFixed(0)}%, Position Y: ${decalPosY.toFixed(2)}).`;

    addItem({
      id: `configured-${Date.now()}`,
      name: `Yeulumin ${designLabel} Tee`,
      description,
      price: 999,
      quantity,
      image: cartImage,
      size,
      color,
      style: designLabel,
      prompt: (design === "ai" && customPrompt) ? customPrompt : undefined,
    });

    setTimeout(() => {
      setAddingToCart(false);
    }, 800);
  };

  return (
    <aside className="w-[220px] h-full bg-[#111] border-l border-[#222] flex flex-col justify-between overflow-y-auto select-none">
      <div className="flex flex-col p-4 gap-6">
        {/* 1. BRAND LOGO */}
        <div className="border-b border-[#222] pb-3">
          <h1 className="text-[13px] tracking-[3px] text-[#00FFB2] font-black uppercase">
            YEULUMIN AI
          </h1>
        </div>

        {/* 2. T-SHIRT COLOR */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] tracking-[2px] text-[#666] uppercase font-semibold">
            T-Shirt Color
          </label>
          <div className="grid grid-cols-5 gap-2">
            {COLOR_SWATCHES.map((swatch) => {
              const isActive = color.toLowerCase() === swatch.hex.toLowerCase();
              return (
                <button
                  key={swatch.name}
                  onClick={() => setColor(swatch.hex)}
                  className={`h-7 w-7 rounded-full border-2 cursor-pointer transition-all duration-200 ${
                    isActive
                      ? "border-[#00FFB2] scale-110 shadow-[0_0_10px_rgba(0,255,178,0.4)]"
                      : "border-transparent hover:scale-105"
                  }`}
                  style={{ backgroundColor: swatch.hex }}
                  title={swatch.name}
                />
              );
            })}
          </div>
        </div>

        {/* 3. DESIGN */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] tracking-[2px] text-[#666] uppercase font-semibold">
            Design
          </label>
          <div className="grid grid-cols-2 gap-2">
            {DESIGNS.map((d) => {
              const isActive = design === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => setDesign(d.id)}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border cursor-pointer transition-all duration-200 ${
                    isActive
                      ? "bg-[#00FFB2] border-[#00FFB2] text-black font-bold shadow-[0_0_15px_rgba(0,255,178,0.25)]"
                      : "bg-[#161616] border-[#222] text-[#888] hover:border-[#444] hover:text-white"
                  }`}
                >
                  <span className="text-base mb-1">{d.icon}</span>
                  <span className="text-[10px] tracking-wide">{d.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ADJUST PRINT (only show if design is not 'none') */}
        {design !== "none" && (
          <div className="flex flex-col gap-3 bg-[#161616]/30 border border-[#222]/40 rounded-xl p-3 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[#222] pb-1.5">
              <label className="text-[10px] tracking-[2px] text-[#00FFB2] uppercase font-bold">
                Adjust Print
              </label>
              <button
                type="button"
                onClick={resetDecalPlacement}
                className="text-[8px] font-mono text-neutral-500 hover:text-white uppercase tracking-wider cursor-pointer"
              >
                Reset
              </button>
            </div>
            
            {/* Print Placement */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[8px] font-mono text-[#666] uppercase tracking-wider">Placement</span>
              <div className="flex bg-[#111] p-0.5 rounded-lg border border-[#222]">
                {(["front", "back"] as const).map((target) => {
                  const isActive = decalTarget === target;
                  return (
                    <button
                      key={target}
                      type="button"
                      onClick={() => setDecalTarget(target)}
                      className={`flex-1 py-1 text-[9px] font-bold uppercase rounded-md cursor-pointer transition-all duration-200 ${
                        isActive ? "bg-[#00FFB2] text-black" : "text-[#888] hover:text-white"
                      }`}
                    >
                      {target}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scale Slider */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[8px] font-mono text-neutral-500">
                <span>Scale</span>
                <span className="text-neutral-300">{(decalScale * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.6"
                step="0.01"
                value={decalScale}
                onChange={(e) => setDecalScale(parseFloat(e.target.value))}
                className="w-full accent-[#00FFB2] cursor-pointer h-1 bg-[#222] rounded-lg appearance-none"
              />
            </div>

            {/* Vertical Slider */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[8px] font-mono text-neutral-500">
                <span>Vertical Pos</span>
                <span className="text-neutral-300">{decalPosY.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="-0.1"
                max="0.2"
                step="0.01"
                value={decalPosY}
                onChange={(e) => setDecalPosY(parseFloat(e.target.value))}
                className="w-full accent-[#00FFB2] cursor-pointer h-1 bg-[#222] rounded-lg appearance-none"
              />
            </div>

            {/* Horizontal Slider */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[8px] font-mono text-neutral-500">
                <span>Horizontal Pos</span>
                <span className="text-neutral-300">{decalPosX.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="-0.1"
                max="0.1"
                step="0.01"
                value={decalPosX}
                onChange={(e) => setDecalPosX(parseFloat(e.target.value))}
                className="w-full accent-[#00FFB2] cursor-pointer h-1 bg-[#222] rounded-lg appearance-none"
              />
            </div>
          </div>
        )}

        {/* 4. VIEW */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] tracking-[2px] text-[#666] uppercase font-semibold">
            View
          </label>
          <div className="flex bg-[#161616] p-0.5 rounded-lg border border-[#222]">
            {VIEWS.map((v) => {
              const isActive = view === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => setView(v.id)}
                  className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded-md cursor-pointer transition-all duration-200 ${
                    isActive ? "bg-[#7B2FFF] text-white" : "text-[#888] hover:text-white"
                  }`}
                >
                  {v.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. SIZE */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] tracking-[2px] text-[#666] uppercase font-semibold">
            Size
          </label>
          <div className="flex flex-wrap gap-1">
            {SIZES.map((sz) => {
              const isActive = size === sz;
              return (
                <button
                  key={sz}
                  onClick={() => setSize(sz)}
                  className={`h-7 w-7 text-[10px] font-bold rounded flex items-center justify-center border cursor-pointer transition-all duration-200 ${
                    isActive
                      ? "bg-[#00FFB2] border-[#00FFB2] text-black shadow-[0_0_10px_rgba(0,255,178,0.2)]"
                      : "bg-[#161616] border-[#222] text-[#888] hover:border-[#444] hover:text-white"
                  }`}
                >
                  {sz}
                </button>
              );
            })}
          </div>
        </div>

        {/* 6. QUANTITY */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] tracking-[2px] text-[#666] uppercase font-semibold">
            Quantity
          </label>
          <div className="flex items-center gap-1 bg-[#161616] border border-[#222] rounded-lg max-w-[120px]">
            <button
              onClick={() => setQuantity(quantity - 1)}
              className="p-2 text-[#666] hover:text-white transition-colors cursor-pointer"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="flex-1 text-center font-mono text-xs text-white">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-2 text-[#666] hover:text-white transition-colors cursor-pointer"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* FOOTER CTA SECTION */}
      <div className="p-4 border-t border-[#222] bg-[#161616]/40 flex flex-col gap-3.5">
        {/* 7. PRICE */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-[20px] font-black text-[#00FFB2] font-mono">
            ₹{999 * quantity}
          </span>
          <span className="text-[10px] text-[#666] uppercase">/ {quantity} piece{quantity > 1 ? 's' : ''}</span>
        </div>

        {/* 7.5. SAVE TO COLLECTION */}
        <button
          onClick={handleSaveToCollection}
          disabled={savingToCollection}
          className="w-full py-2.5 rounded-lg border border-neutral-800 hover:border-violet/40 hover:text-violet-300 bg-[#0A0A0A]/40 text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 disabled:opacity-50"
        >
          <FolderHeart className="h-4 w-4" />
          <span>{savingToCollection ? "Saving..." : saveSuccess ? "Saved!" : "Save to Collection"}</span>
        </button>

        {/* 8. ADD TO CART */}
        <button
          onClick={handleAddToCart}
          disabled={addingToCart}
          className="w-full py-3 rounded-lg font-bold text-xs uppercase tracking-wider text-black flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(0,255,178,0.3)] disabled:opacity-50 disabled:pointer-events-none"
          style={{
            background: "linear-gradient(135deg, #00FFB2, #00cc8e)",
          }}
        >
          <ShoppingBag className="h-4.5 w-4.5" />
          <span>{addingToCart ? "Adding..." : "Add to Cart"}</span>
        </button>
      </div>
    </aside>
  );
}
