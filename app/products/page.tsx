"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, MoreVertical, ShoppingBag, Heart, Sparkles, X, Home as HomeIcon, Image as GalleryIcon, Loader2, User as UserIcon } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import GrainOverlay from "../components/GrainOverlay";
import { PRODUCTS, CATEGORIES, Product } from "../lib/products";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useCartStore } from "../store/cartStore";

export default function ProductsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  // States
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [cartSuccessId, setCartSuccessId] = useState<string | null>(null);
  const [wishlistedIds, setWishlistedIds] = useState<string[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [dbLoading, setDbLoading] = useState(false);

  // Fetch db products if supabase is ready
  useEffect(() => {
    const fetchDbProducts = async () => {
      if (!isSupabaseConfigured()) return;
      setDbLoading(true);
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (data && data.length > 0) {
          const mapped: Product[] = data.map((d: any, idx: number) => ({
            id: d.id,
            name: d.name,
            description: d.description || "",
            price: Number(d.price),
            badge: d.badge,
            image: d.image,
            category: d.category,
            tags: d.tags || [],
            defaultColor: d.default_color,
            defaultView: d.default_view,
            printPosition: d.print_position,
            version: d.version || `Version ${idx + 1}`
          }));
          setProducts(mapped);
        }
      } catch (err) {
        console.warn("Failed to load products from database, falling back to static:", err);
      } finally {
        setDbLoading(false);
      }
    };

    fetchDbProducts();
  }, []);

  const handleToggleWishlist = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setWishlistedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    setActiveMenuId(null);
  };

  const handleAddToCart = (product: Product, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!user) {
      router.push(`/auth?redirect=/products`);
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
    setActiveMenuId(null);
    setTimeout(() => setCartSuccessId(null), 2500);
  };

  // Filter and sort products
  const processedProducts = useMemo(() => {
    let result = [...products];

    // Category Filter
    if (selectedCategory !== "All") {
      result = result.filter(
        (p) => p.category.toLowerCase() === selectedCategory.toLowerCase() ||
               p.tags.some(t => t.toLowerCase() === selectedCategory.toLowerCase())
      );
    }

    // Search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.tags.some((t) => t.toLowerCase().includes(query))
      );
    }

    return result;
  }, [products, selectedCategory, searchQuery]);

  return (
    <div className="relative min-h-screen flex flex-col bg-[#F5F6F8] text-[#0A0A0A] overflow-hidden antialiased">
      <GrainOverlay />
      
      {/* Desktop Header Navbar */}
      <Navbar />

      <main className="flex-grow mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12 select-none">
        
        {/* ─── GALLERY HEADER TOP BAR (MOBILE LOOKUP) ─── */}
        <div className="w-full flex items-center justify-between py-4 border-b border-neutral-200/60 mb-6 bg-transparent">
          
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-neutral-200/50 transition-colors cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft className="h-5 w-5 text-neutral-800" />
          </button>

          {isSearchOpen ? (
            <div className="flex-grow mx-4 relative flex items-center">
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search gallery matrix..."
                className="w-full bg-white border border-neutral-200 focus:border-neutral-400 rounded-full py-1.5 pl-4 pr-10 text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none shadow-sm"
              />
              <button
                onClick={() => {
                  setSearchQuery("");
                  setIsSearchOpen(false);
                }}
                className="absolute right-3 text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              <h1 className="font-sans text-lg font-bold text-neutral-800 uppercase tracking-wider">
                Gallery
              </h1>
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 rounded-full hover:bg-neutral-200/50 transition-colors cursor-pointer"
                title="Search Styles"
              >
                <Search className="h-5 w-5 text-neutral-800" />
              </button>
            </>
          )}

        </div>

        {/* ─── CATEGORY TABS (HORIZONTAL PILLS) ─── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none w-full mb-8">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs font-semibold px-5 py-2.5 rounded-full transition-all duration-200 uppercase tracking-widest whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-black text-white font-bold shadow-sm"
                    : "bg-white border border-neutral-200 text-neutral-500 hover:border-neutral-400 hover:text-black"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* ─── DYNAMIC MATRIX GRID ─── */}
        {dbLoading ? (
          <div className="py-32 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 text-neutral-400 animate-spin" />
            <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
              Connecting matrix nodes...
            </span>
          </div>
        ) : processedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {processedProducts.map((product) => {
              const isWishlisted = wishlistedIds.includes(product.id);
              const isMenuOpen = activeMenuId === product.id;

              return (
                <div
                  key={product.id}
                  className="bg-white border border-neutral-200/60 hover:border-neutral-300 rounded-2xl overflow-hidden group flex flex-col justify-between transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <div className="relative">
                    {/* Visual Card Image */}
                    <Link
                      href={`/customize?preset=${product.id}`}
                      className="aspect-square w-full bg-[#F9FAFB] overflow-hidden flex items-center justify-center p-6 block relative"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-103"
                      />
                    </Link>

                    {/* Direct success prompt */}
                    {cartSuccessId === product.id && (
                      <div className="absolute inset-0 bg-black/80 flex items-center justify-center text-white text-xs font-bold font-mono tracking-widest rounded-t-2xl z-10">
                        ADDED TO CART!
                      </div>
                    )}
                  </div>

                  {/* Card footer details & Context menu */}
                  <div className="p-5 flex justify-between items-center relative border-t border-neutral-100 bg-white">
                    <div className="text-left">
                      <h3 className="font-bold text-neutral-800 text-sm group-hover:text-black transition-colors leading-tight">
                        {product.name}
                      </h3>
                      <span className="text-[10px] text-neutral-400 font-mono block mt-1">
                        {product.version}
                      </span>
                    </div>

                    <div className="relative">
                      {/* Vertical three dots toggle */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(isMenuOpen ? null : product.id);
                        }}
                        className="p-1.5 rounded-full hover:bg-neutral-100 transition-colors text-neutral-500 hover:text-neutral-800 cursor-pointer"
                        title="Options"
                      >
                        <MoreVertical className="h-4.5 w-4.5" />
                      </button>

                      {/* Dropdown Options menu */}
                      {isMenuOpen && (
                        <>
                          {/* Close overlay click-catcher */}
                          <div
                            className="fixed inset-0 z-30"
                            onClick={() => setActiveMenuId(null)}
                          />
                          
                          <div className="absolute right-0 bottom-8 w-44 rounded-xl bg-white border border-neutral-200/80 p-1.5 shadow-xl z-40 flex flex-col gap-0.5 animate-fadeIn">
                            <Link
                              href={`/customize?preset=${product.id}`}
                              className="px-3 py-2 text-[11px] font-semibold text-neutral-700 hover:bg-neutral-50 hover:text-black rounded-lg text-left flex items-center gap-2"
                            >
                              <Sparkles className="h-3.5 w-3.5" />
                              <span>Remix in Lab</span>
                            </Link>
                            <button
                              onClick={() => handleAddToCart(product)}
                              className="px-3 py-2 text-[11px] font-semibold text-neutral-700 hover:bg-neutral-50 hover:text-black rounded-lg text-left flex items-center gap-2 cursor-pointer w-full"
                            >
                              <ShoppingBag className="h-3.5 w-3.5" />
                              <span>Add to Cart (₹{product.price})</span>
                            </button>
                            <button
                              onClick={() => handleToggleWishlist(product.id)}
                              className={`px-3 py-2 text-[11px] font-semibold rounded-lg text-left flex items-center gap-2 cursor-pointer w-full ${
                                isWishlisted
                                  ? "text-red-500 hover:bg-red-50/20"
                                  : "text-neutral-700 hover:bg-neutral-50"
                              }`}
                            >
                              <Heart className={`h-3.5 w-3.5 ${isWishlisted ? "fill-current" : ""}`} />
                              <span>{isWishlisted ? "Wishlisted" : "Add to Wishlist"}</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-24 text-center border border-dashed border-neutral-200 rounded-2xl max-w-md mx-auto">
            <span className="text-2xl">🔍</span>
            <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mt-2">
              No matching drop versions found
            </h3>
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
          className="flex flex-col items-center gap-1 text-neutral-400 hover:text-neutral-900 transition-colors py-1.5 px-3 relative"
        >
          <GalleryIcon className="h-5 w-5 text-neutral-900" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-900">Gallery</span>
          <div className="absolute bottom-0 h-1.5 w-1.5 rounded-full bg-emerald-500" />
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
          <UserIcon className="h-5 w-5" />
          <span className="text-[9px] uppercase tracking-wider font-semibold">Profile</span>
        </Link>

      </nav>

    </div>
  );
}
