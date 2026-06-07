"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, Sparkles, ArrowUpDown, ChevronDown } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import GrainOverlay from "../components/GrainOverlay";
import { PRODUCTS, CATEGORIES, Product } from "../lib/products";

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popular"); // popular, newest, price-low, price-high

  // Filter and sort products
  const processedProducts = useMemo(() => {
    let result = [...PRODUCTS];

    // 1. Category Filter
    if (selectedCategory !== "All") {
      result = result.filter(
        (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // 2. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // 3. Sorting
    if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "newest") {
      // Simulate newest by putting higher IDs or specific badges first
      result.sort((a, b) => {
        if (a.badge === "New Drop" && b.badge !== "New Drop") return -1;
        if (a.badge !== "New Drop" && b.badge === "New Drop") return 1;
        return Number(b.id) - Number(a.id);
      });
    } else {
      // "popular" sorting: bestseller badge first
      result.sort((a, b) => {
        if (a.badge === "Bestseller" && b.badge !== "Bestseller") return -1;
        if (a.badge !== "Bestseller" && b.badge === "Bestseller") return 1;
        return 0;
      });
    }

    return result;
  }, [selectedCategory, searchQuery, sortBy]);

  return (
    <div className="relative min-h-screen flex flex-col bg-[#0A0A0A] light:bg-[#FAFAFA] text-[#f5f5f5] light:text-[#0A0A0A] transition-colors duration-300">
      <GrainOverlay />
      <Navbar />

      <main className="flex-grow mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Title */}
        <div className="flex flex-col gap-2 mb-10 text-left">
          <div className="flex items-center gap-2 text-xs font-mono text-neon uppercase tracking-widest">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Matrix Catalogue</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight uppercase text-white light:text-zinc-900">
            EXPLORE THE DROPS
          </h1>
          <div className="h-[2px] w-16 bg-neon mt-2" />
        </div>

        {/* Filter bar */}
        <div className="flex flex-col gap-6 bg-[#111111]/30 light:bg-white border border-neutral-900 light:border-zinc-200 rounded-xl p-6 backdrop-blur-md mb-8 transition-colors">
          
          {/* Top Row: Search + Sort */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-grow max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search custom vectors, tags, or names..."
                className="w-full bg-[#111111] light:bg-zinc-50 border border-neutral-800 light:border-zinc-200 focus:border-neon light:focus:border-violet focus:ring-1 focus:ring-neon light:focus:ring-violet rounded-lg py-2.5 pl-10 pr-4 text-xs text-neutral-300 light:text-zinc-900 placeholder-neutral-600 light:placeholder-zinc-400 focus:outline-none transition-all"
              />
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-neutral-600 light:text-zinc-400" />
            </div>

            {/* Sort Select */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-neutral-500 flex items-center gap-1.5 whitespace-nowrap">
                <ArrowUpDown className="h-3.5 w-3.5" />
                Sort By:
              </span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-[#111111] light:bg-zinc-50 border border-neutral-800 light:border-zinc-200 hover:border-neutral-700 light:hover:border-zinc-300 text-neutral-300 light:text-zinc-800 text-xs rounded-lg pl-3 pr-8 py-2.5 focus:outline-none focus:border-neon light:focus:border-violet transition-colors cursor-pointer"
                >
                  <option value="popular">Popular drops</option>
                  <option value="newest">Newest additions</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-3 h-3.5 w-3.5 text-neutral-500 pointer-events-none" />
              </div>
            </div>

          </div>

          {/* Bottom Row: Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
            <span className="text-xs font-mono text-neutral-500 flex items-center gap-1.5 mr-2 whitespace-nowrap">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filter Matrix:
            </span>
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs font-semibold px-4 py-2 rounded-lg border transition-all duration-200 uppercase tracking-wider whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-neon border-neon text-[#0A0A0A] light:bg-violet light:border-violet light:text-white font-bold glow-neon light:glow-violet"
                      : "bg-[#111111]/40 light:bg-zinc-100 border-neutral-900 light:border-zinc-200 text-neutral-400 light:text-zinc-550 hover:border-neutral-700 light:hover:border-zinc-300 hover:text-white light:hover:text-zinc-900"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

        </div>

        {/* Results Info */}
        <div className="text-xs font-mono text-neutral-500 mb-6 flex justify-between">
          <span>Found {processedProducts.length} units in collection</span>
          {searchQuery && (
            <span>
              Searching for: <strong className="text-neon">"{searchQuery}"</strong>
            </span>
          )}
        </div>

        {/* Product Grid */}
        {processedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {processedProducts.map((product) => (
              <div
                key={product.id}
                className="bg-[#111111]/30 light:bg-white border border-neutral-900 light:border-zinc-200 hover:border-neon/30 light:hover:border-violet/30 rounded-xl overflow-hidden group flex flex-col justify-between transition-all duration-300"
              >
                <div>
                  {/* Image wrapper */}
                  <div className="relative aspect-square w-full bg-neutral-950 light:bg-zinc-100 overflow-hidden">
                    {/* Badge */}
                    <span className="absolute top-3.5 left-3.5 z-10 text-[9px] font-mono font-bold tracking-widest uppercase bg-[#0A0A0A]/90 light:bg-zinc-50 border border-neutral-800 light:border-zinc-200 text-neon light:text-violet px-2 py-0.5 rounded">
                      {product.badge}
                    </span>

                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
                      <Link
                        href={`/customize?preset=${product.id}`}
                        className="w-full text-center py-2.5 bg-neon text-[#0A0A0A] text-xs font-bold rounded-lg glow-neon transition-transform"
                      >
                        Remix in Design Lab
                      </Link>
                    </div>
                  </div>

                  {/* Detail contents */}
                  <div className="p-6">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-500 light:text-zinc-500 block mb-1.5">
                      {product.category}
                    </span>
                    <div className="flex justify-between items-baseline mb-3">
                      <h2 className="font-bold text-neutral-200 light:text-zinc-800 text-base group-hover:text-white light:group-hover:text-zinc-950 transition-colors">
                        {product.name}
                      </h2>
                      <span className="font-mono text-neon light:text-violet font-bold text-base whitespace-nowrap ml-2">
                        ₹{product.price}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 light:text-zinc-650 leading-relaxed line-clamp-3">
                      {product.description}
                    </p>
                  </div>
                </div>

                {/* Card footer details / Tags */}
                <div className="px-6 pb-6 pt-2 border-t border-neutral-900/30 light:border-zinc-100 flex flex-wrap gap-1.5">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      onClick={() => setSearchQuery(tag)}
                      className="text-[9px] font-mono text-neutral-500 light:text-zinc-500 bg-neutral-950 light:bg-zinc-50 px-2 py-1 rounded border border-neutral-900/80 light:border-zinc-200 hover:text-neon light:hover:text-violet hover:border-neon/30 light:hover:border-violet/30 transition-colors cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-neutral-900 light:border-zinc-200 rounded-xl py-24 text-center max-w-md mx-auto mt-12 flex flex-col items-center gap-4">
            <SlidersHorizontal className="h-10 w-10 text-neutral-700 light:text-zinc-400 animate-pulse" />
            <h3 className="text-sm font-bold text-neutral-400 light:text-zinc-800 uppercase tracking-wider">
              No Drops Matching Matrix
            </h3>
            <p className="text-xs text-neutral-600 light:text-zinc-500 max-w-xs">
              We couldn't find any clothing with the selected parameters. Reset filters or clear your search input to refresh.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("All");
                setSearchQuery("");
                setSortBy("popular");
              }}
              className="text-xs font-semibold text-neon light:text-violet hover:underline cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
