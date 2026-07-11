"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ShoppingBag, Heart, Search, SlidersHorizontal, ArrowRight, Home as HomeIcon, Image as GalleryIcon, User, Menu, X, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import GrainOverlay from "./components/GrainOverlay";
import { PRODUCTS, Product } from "./lib/products";
import { useAuth } from "./context/AuthContext";
import { useCartStore } from "./store/cartStore";

const HERO_IMAGES = [
  "/landing_page/ChatGPT Image Jun 30, 2026, 11_23_11 AM.png",
  "/landing_page/ChatGPT Image Jun 30, 2026, 11_27_10 AM.png",
  "/landing_page/ChatGPT Image Jun 30, 2026, 11_29_18 AM.png",
  "/landing_page/ChatGPT Image Jun 30, 2026, 11_38_39 AM.png"
];

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  // States
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [cartSuccessId, setCartSuccessId] = useState<string | null>(null);
  const [wishlistedIds, setWishlistedIds] = useState<string[]>([]);
  const [heroSlide, setHeroSlide] = useState(0);

  // Auto slide dots indicator simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroSlide((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlide]);

  const handleToggleWishlist = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlistedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push(`/auth?redirect=/`);
      return;
    }

    addItem({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      quantity: 1,
      size: "M",
      color: product.defaultColor || "#ffffff",
      image: product.image,
      style: product.printPosition || "front",
    });

    setCartSuccessId(product.id);
    setTimeout(() => setCartSuccessId(null), 2500);
  };

  // Filtered products list
  const filteredProducts = useMemo(() => {
    let result = [...PRODUCTS];

    if (selectedCategory !== "All") {
      result = result.filter(
        (p) => p.category.toLowerCase() === selectedCategory.toLowerCase() ||
               p.tags.some(t => t.toLowerCase() === selectedCategory.toLowerCase())
      );
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return result;
  }, [selectedCategory, searchQuery]);

  return (
    <div className="relative min-h-screen flex flex-col bg-[#F5F6F8] text-[#0A0A0A] overflow-hidden antialiased">
      <GrainOverlay />
      
      {/* Desktop Header Navbar */}
      <Navbar />

      {/* ─── 1. HERO CAROUSEL SECTION ─── */}
      <section className="relative w-full flex flex-col items-center select-none py-0 px-0 -mt-20">
        <div className="relative w-full aspect-square md:aspect-[1652/952] overflow-hidden flex items-center justify-center group/carousel bg-[#edeef2]">
          {/* Slides container */}
          {HERO_IMAGES.map((img, index) => {
            return (
              <div
                key={index}
                className="absolute inset-0 transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(${(index - heroSlide) * 100}%)`,
                }}
              >
                <img
                  src={img}
                  alt={`Hero Slide ${index + 1}`}
                  className="w-full h-full object-contain md:object-cover"
                />
              </div>
            );
          })}

          {/* Left navigation arrow */}
          <button
            onClick={() => setHeroSlide((prev) => (prev - 1 + HERO_IMAGES.length) % HERO_IMAGES.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border border-white/10 flex items-center justify-center shadow-md hover:scale-105 transition-all opacity-0 group-hover/carousel:opacity-100 focus:opacity-100 z-20 cursor-pointer"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Right navigation arrow */}
          <button
            onClick={() => setHeroSlide((prev) => (prev + 1) % HERO_IMAGES.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border border-white/10 flex items-center justify-center shadow-md hover:scale-105 transition-all opacity-0 group-hover/carousel:opacity-100 focus:opacity-100 z-20 cursor-pointer"
            aria-label="Next Slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Bottom dot indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 bg-black/40 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/10">
            {HERO_IMAGES.map((_, i) => (
              <button
                key={i}
                onClick={() => setHeroSlide(i)}
                className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
                  heroSlide === i ? "w-4 bg-white" : "w-1 bg-white/40 hover:bg-white/60"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── 2. CURRENT OFFERS BANNER ─── */}
      <section className="w-full px-4 sm:px-6 md:px-0 my-10 md:my-0">
        <Link
          href="/products"
          className="block relative w-full aspect-[1706/922] rounded-2xl md:rounded-none overflow-hidden shadow-md md:shadow-none group border border-neutral-200/40 md:border-none"
        >
          <img
            src="/offers/ChatGPT Image Jun 30, 2026, 11_45_28 AM.png"
            alt="Current Offers Banner"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
          />
        </Link>
      </section>

      <main className="flex-grow mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12">

        {/* ─── 3. PRE-DEFINED STYLES GRID SECTION ─── */}
        <section className="my-12">
          
          {/* Header titles */}
          <div className="flex justify-between items-end mb-8">
            <div className="text-left flex flex-col gap-1">
              <h2 className="font-display text-2xl font-black uppercase tracking-wider text-[#0A0A0A]">
                PRE-DEFINED STYLES
              </h2>
              <div className="h-[2px] w-12 bg-neutral-900" />
            </div>
            <Link
              href="/products"
              className="text-xs font-semibold text-neutral-500 hover:text-black transition-colors flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Filter Bar & Search Row */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
            
            {/* Category pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto scrollbar-none">
              {["All", "Minimal", "Streetwear", "Typographic", "Vintage", "Anime"].map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-xs font-semibold px-4 py-2 rounded-xl border transition-all duration-200 uppercase tracking-wider whitespace-nowrap cursor-pointer ${
                      isActive
                        ? "bg-blue-50 border-blue-500 text-blue-600 font-bold shadow-sm"
                        : "bg-white border-neutral-200 text-neutral-400 hover:border-neutral-400 hover:text-[#0A0A0A]"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Search Input Box */}
            <div className="relative w-full sm:max-w-xs">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search styles"
                className="w-full bg-white border border-neutral-200 focus:border-neutral-400 rounded-xl py-2 pl-9 pr-4 text-xs text-neutral-700 placeholder-neutral-400 focus:outline-none transition-all shadow-sm"
              />
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
            </div>

          </div>

          {/* Catalog products list cards */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => {
                const isWishlisted = wishlistedIds.includes(product.id);
                return (
                  <div
                    key={product.id}
                    className="bg-white border border-neutral-200/80 hover:border-neutral-300 rounded-2xl overflow-hidden group flex flex-col justify-between transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <div>
                      {/* Image container */}
                      <div className="relative aspect-square w-full bg-[#F9FAFB] overflow-hidden flex items-center justify-center p-6">
                        
                        {/* Custom Wishlist heart trigger */}
                        <button
                          onClick={(e) => handleToggleWishlist(product.id, e)}
                          className={`absolute top-4 right-4 z-20 p-2 rounded-full border bg-white shadow-sm transition-all duration-200 hover:scale-105 cursor-pointer ${
                            isWishlisted
                              ? "border-red-100 text-red-500 fill-current"
                              : "border-neutral-100 text-neutral-400 hover:text-red-500"
                          }`}
                        >
                          <Heart className="h-4 w-4" />
                        </button>

                        <img
                          src={product.image}
                          alt={product.name}
                          className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-103"
                        />

                        {/* Interactive hover overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
                          <Link
                            href={`/customize?preset=${product.id}`}
                            className="px-6 py-2.5 bg-white text-black text-xs font-bold rounded-lg shadow hover:bg-neutral-100 transition-colors uppercase tracking-wider"
                          >
                            Remix in Studio
                          </Link>
                        </div>
                      </div>

                      {/* Detail contents */}
                      <div className="p-6 text-left">
                        <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-400 block mb-1.5 font-bold">
                          {product.category}
                        </span>
                        <div className="flex justify-between items-start mb-0">
                          <h3 className="font-bold text-neutral-800 text-base group-hover:text-black transition-colors leading-snug">
                            {product.name}
                          </h3>
                          <span className="font-mono text-neutral-900 font-bold text-base whitespace-nowrap ml-3">
                            ₹{product.price}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions footer */}
                    <div className="px-6 pb-6 pt-0 flex gap-3">
                      <button
                        onClick={(e) => handleAddToCart(product, e)}
                        className="w-full py-2.5 bg-[#111111] hover:bg-black text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                      >
                        <ShoppingBag className="h-4 w-4" />
                        <span>{cartSuccessId === product.id ? "Added!" : "Add to Cart"}</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-24 text-center border border-dashed border-neutral-200 rounded-2xl max-w-md mx-auto">
              <span className="text-2xl">🔍</span>
              <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mt-2">
                No Matching Styles Found
              </h3>
            </div>
          )}

        </section>

      </main>

      <Footer />

      {/* ─── 4. FLOATING ACTION BUTTON ─── */}
      <Link
        href="/customize"
        className="fixed bottom-24 right-6 z-40 h-14 w-14 rounded-full bg-blue-600 text-white shadow-xl hover:bg-blue-700 hover:scale-105 transition-all flex items-center justify-center md:bottom-6"
        title="Open Design Lab"
      >
        <Sparkles className="h-6 w-6 fill-current" />
      </Link>

      {/* ─── 5. MOBILE BOTTOM TAB NAVIGATION ─── */}
      <nav className="fixed bottom-0 inset-x-0 h-16 bg-white border-t border-neutral-200/80 md:hidden flex justify-around items-center z-40 px-2 shadow-[0_-5px_15px_rgba(0,0,0,0.03)]">
        
        <Link
          href="/"
          className="flex flex-col items-center gap-1 text-neutral-400 hover:text-neutral-900 transition-colors py-1.5 px-3 relative"
        >
          <HomeIcon className="h-5 w-5 text-neutral-900" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-900">Home</span>
          <div className="absolute bottom-0 h-1.5 w-1.5 rounded-full bg-emerald-500" />
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
          className="flex flex-col items-center gap-1 text-neutral-400 hover:text-neutral-900 transition-colors py-1.5 px-3"
        >
          <Heart className="h-5 w-5" />
          <span className="text-[9px] uppercase tracking-wider font-semibold">Wishlist</span>
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
