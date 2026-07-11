"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { Sparkles, Trash2, ArrowRight, ArrowLeft, Heart, Loader2, ShoppingBag, Home as HomeIcon, Image as GalleryIcon, User } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import GrainOverlay from "../components/GrainOverlay";
import { useCartStore } from "../store/cartStore";

interface SavedCustomization {
  id: string;
  name: string;
  description: string | null;
  color: string;
  design: string;
  custom_texture_url: string | null;
  custom_prompt: string | null;
  decal_scale: number;
  decal_pos_x: number;
  decal_pos_y: number;
  decal_target: string;
  created_at: string;
}

export default function UserCollectionPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [customizations, setCustomizations] = useState<SavedCustomization[]>([]);
  const [loading, setLoading] = useState(true);

  const addItem = useCartStore((state) => state.addItem);
  const [cartSuccessId, setCartSuccessId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth?redirect=/collection");
    }
  }, [user, authLoading, router]);

  const fetchCollection = async () => {
    if (!user || !isSupabaseConfigured()) return;
    try {
      const { data, error } = await supabase
        .from("customizations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCustomizations(data || []);
    } catch (err) {
      console.error("Failed to load collection:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCollection();
    }
  }, [user]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!confirm("Are you sure you want to delete this design?")) return;

    try {
      const { error } = await supabase.from("customizations").delete().eq("id", id);
      if (error) throw error;
      setCustomizations((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete design.");
    }
  };

  const handleAddToCart = (item: SavedCustomization) => {
    addItem({
      id: `configured-${item.id}-${Date.now()}`,
      name: item.name,
      description: item.description || "Bespoke customized streetwear design.",
      price: 999, // Custom items are ₹999
      quantity: 1,
      size: "M", // default size
      color: item.color,
      image: item.custom_texture_url || "/tshirt-blank.png", // Decal texture URL or a blank t-shirt fallback
      style: item.design,
    });

    setCartSuccessId(item.id);
    setTimeout(() => setCartSuccessId(null), 2500);
  };

  if (authLoading || (user && loading)) {
    return (
      <div className="relative min-h-screen flex flex-col justify-between bg-[#F5F6F8] text-[#0A0A0A] antialiased">
        <GrainOverlay />
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
              Accessing your personal matrix...
            </span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-[#F5F6F8] text-[#0A0A0A] antialiased">
      <GrainOverlay />
      <Navbar />

      <main className="flex-grow mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Title */}
        <div className="flex flex-col gap-2 mb-10 text-left">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider">
            <Heart className="h-4 w-4 fill-current" />
            <span>Neural Collections</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight uppercase text-neutral-900">
            MY DESIGNS
          </h1>
          <div className="h-[2px] w-12 bg-neutral-900 mt-2" />
        </div>

        {customizations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {customizations.map((item) => {
              // Create dynamic remix URL passing all specific styling states
              const remixUrl = `/customize?color=${encodeURIComponent(item.color)}&design=${encodeURIComponent(item.design)}&texture=${encodeURIComponent(item.custom_texture_url || "")}&scale=${item.decal_scale}&x=${item.decal_pos_x}&y=${item.decal_pos_y}&target=${encodeURIComponent(item.decal_target)}`;

              return (
                <div
                  key={item.id}
                  className="bg-white border border-neutral-200/80 hover:border-neutral-300 rounded-2xl overflow-hidden group flex flex-col justify-between transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <div>
                    {/* Image wrapper */}
                    <div className="relative aspect-square w-full bg-[#F9FAFB] overflow-hidden flex items-center justify-center p-8">
                      {/* Avatar preview decal or default */}
                      {item.custom_texture_url ? (
                        <img
                          src={item.custom_texture_url}
                          alt={item.name}
                          className="max-h-full max-w-full object-contain rounded border border-neutral-100 transition-transform duration-500 group-hover:scale-103 bg-white"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-neutral-400">
                          <span className="text-3xl">⬜</span>
                          <span className="text-[10px] font-mono uppercase tracking-wider">
                            Procedural Design
                          </span>
                        </div>
                      )}

                      {/* Delete button */}
                      <button
                        onClick={(e) => handleDelete(item.id, e)}
                        className="absolute top-3.5 right-3.5 z-10 p-2 rounded-full bg-white border border-neutral-200 text-neutral-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50/20 transition-all cursor-pointer shadow-sm"
                        title="Delete design"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
                        <Link
                          href={remixUrl}
                          className="px-6 py-2.5 bg-white text-black text-xs font-bold rounded-lg shadow hover:bg-neutral-100 transition-all uppercase tracking-wider"
                        >
                          Remix in Design Lab
                        </Link>
                      </div>
                    </div>

                    {/* Detail contents */}
                    <div className="p-6 text-left">
                      <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-400 block mb-1.5 font-bold">
                        Style: {item.design.toUpperCase()} | Color:{" "}
                        <span
                          className="inline-block w-2.5 h-2.5 rounded-full border border-neutral-200 align-middle"
                          style={{ backgroundColor: item.color }}
                        />
                      </span>
                      <div className="flex justify-between items-start mb-4">
                        <h2 className="font-bold text-neutral-800 text-base group-hover:text-black transition-colors leading-snug">
                          {item.name}
                        </h2>
                        <span className="font-mono text-neutral-900 font-bold text-base whitespace-nowrap ml-3">
                          ₹999
                        </span>
                      </div>

                      {/* Add to Cart Button */}
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="w-full py-2.5 bg-[#111111] hover:bg-black text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                      >
                        <ShoppingBag className="h-4 w-4" />
                        <span>{cartSuccessId === item.id ? "Added!" : "Add to Cart (₹999)"}</span>
                      </button>
                    </div>
                  </div>

                  <div className="px-6 pb-6 pt-2 border-t border-neutral-100 flex justify-between items-center bg-white">
                    <span className="text-[9px] font-mono text-neutral-400">
                      Saved: {new Date(item.created_at).toLocaleDateString()}
                    </span>
                    <Link
                      href={remixUrl}
                      className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <span>Load Lab</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="border border-dashed border-neutral-200 rounded-2xl py-24 text-center max-w-md mx-auto mt-12 flex flex-col items-center gap-4 bg-white shadow-sm">
            <Sparkles className="h-10 w-10 text-neutral-400 animate-pulse" />
            <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-widest">
              No Designs Saved Yet
            </h3>
            <p className="text-xs text-neutral-400 max-w-xs leading-relaxed">
              Your personal collection is currently empty. Head over to the Design Lab to compile your custom streetwear configurations.
            </p>
            <Link
              href="/customize"
              className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
            >
              <span>Go to Design Lab</span>
              <ArrowLeft className="h-3 w-3" />
            </Link>
          </div>
        )}
      </main>

      <Footer />

      {/* ─── MOBILE BOTTOM TAB NAVIGATION ─── */}
      <nav className="fixed bottom-0 inset-x-0 h-16 bg-white border-t border-neutral-200/80 md:hidden flex justify-around items-center z-40 px-2 shadow-[0_-5px_15px_rgba(0,0,0,0.03)]">
        
        <Link
          href="/"
          className="flex flex-col items-center gap-1 text-neutral-400 hover:text-neutral-900 transition-colors py-1.5 px-3"
        >
          <HomeIcon className="h-5 w-5" />
          <span className="text-[9px] uppercase tracking-wider font-semibold">Home</span>
        </Link>

        <Link
          href="/products"
          className="flex flex-col items-center gap-1 text-neutral-400 hover:text-neutral-900 transition-colors py-1.5 px-3"
        >
          <GalleryIcon className="h-5 w-5" />
          <span className="text-[9px] uppercase tracking-wider font-semibold">Gallery</span>
        </Link>

        <Link
          href="/collection"
          className="flex flex-col items-center gap-1 text-neutral-400 hover:text-neutral-900 transition-colors py-1.5 px-3 relative"
        >
          <Heart className="h-5 w-5 text-neutral-900 fill-current" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-900">Wishlist</span>
          <div className="absolute bottom-0 h-1.5 w-1.5 rounded-full bg-emerald-500" />
        </Link>

        <Link
          href="/profile"
          className="flex flex-col items-center gap-1 text-neutral-400 hover:text-neutral-900 transition-colors py-1.5 px-3"
        >
          <User className="h-5 w-5" />
          <span className="text-[9px] uppercase tracking-wider font-semibold">Profile</span>
        </Link>

      </nav>

    </div>
  );
}
