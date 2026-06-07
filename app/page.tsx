"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Shield, Cpu, Truck, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import GrainOverlay from "./components/GrainOverlay";
import ParticleCanvas from "./components/ParticleCanvas";
import ThreeMannequin from "./components/ThreeMannequin";
import { PRODUCTS } from "./lib/products";

// Client-side text-scramble/glitch effect component
function GlitchText({ text }: { text: string }) {
  const [displayText, setDisplayText] = useState(text);
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*!_";

  useEffect(() => {
    let iteration = 0;
    let interval: NodeJS.Timeout;

    const triggerGlitch = () => {
      iteration = 0;
      clearInterval(interval);
      interval = setInterval(() => {
        setDisplayText(
          text
            .split("")
            .map((char, index) => {
              if (char === " ") return " ";
              if (index < iteration) {
                return text[index];
              }
              return letters[Math.floor(Math.random() * letters.length)];
            })
            .join("")
        );

        if (iteration >= text.length) {
          clearInterval(interval);
        }
        iteration += 1 / 3;
      }, 25);
    };

    triggerGlitch();
    const mainInterval = setInterval(triggerGlitch, 5000);

    return () => {
      clearInterval(interval);
      clearInterval(mainInterval);
    };
  }, [text]);

  return (
    <span className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-none bg-gradient-to-r from-[#f5f5f5] via-white to-neutral-400 light:from-zinc-950 light:to-zinc-700 bg-clip-text text-transparent">
      {displayText}
    </span>
  );
}

export default function Home() {
  const carouselRef = useRef<HTMLDivElement>(null);
  
  // Carousel Navigation
  const scroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = 350;
      carouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const trendingDrops = PRODUCTS.slice(0, 4);

  return (
    <div className="relative min-h-screen flex flex-col bg-[#0A0A0A] light:bg-[#FAFAFA] text-[#f5f5f5] light:text-[#0A0A0A] transition-colors duration-300">
      {/* Brand aesthetic overlays */}
      <GrainOverlay />
      <Navbar />

      {/* 1. HERO SECTION */}
      <section className="relative w-full min-h-[calc(100vh-80px)] flex items-center justify-center py-12 md:py-20 overflow-hidden">
        {/* Dynamic Canvas Particles */}
        <ParticleCanvas />

        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-neon/5 blur-[120px] pointer-events-none z-0" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-violet/5 blur-[150px] pointer-events-none z-0" />

        <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 flex flex-col items-start text-left gap-6 md:gap-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-neon/30 bg-neon/5 px-3 py-1 text-xs font-semibold text-neon glow-text-neon uppercase tracking-widest font-mono">
              <Sparkles className="h-3 w-3" />
              <span>Next-Gen Neural Print Lab</span>
            </div>

            <div className="flex flex-col">
              <GlitchText text="WEAR YOUR" />
              <span className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-none text-neon glow-text-neon -mt-2">
                IMAGINATION
              </span>
            </div>

            <p className="max-w-xl text-base sm:text-lg text-neutral-400 light:text-zinc-600 font-light leading-relaxed">
              Design any T-shirt with AI in seconds. Interact with your customized clothing on a 3D showroom mannequin. We print in heavy-density ink and ship worldwide.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
              <Link
                href="/customize"
                className="group inline-flex items-center justify-center gap-2 rounded-lg bg-neon px-6 py-3.5 text-sm font-semibold text-[#0A0A0A] hover:bg-[#00e6a0] transition-all duration-300 glow-neon"
              >
                <span>Start Designing</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-800 light:border-zinc-200 bg-[#111111]/40 light:bg-zinc-100 hover:bg-[#111111]/80 light:hover:bg-zinc-200 hover:border-neutral-700 light:hover:border-zinc-300 px-6 py-3.5 text-sm font-semibold text-neutral-300 light:text-zinc-800 transition-all duration-200"
              >
                <span>Browse Collection</span>
              </Link>
            </div>
          </div>

          {/* Hero Right Content: 3D Mannequin */}
          <div className="lg:col-span-5 w-full flex flex-col justify-center animate-float">
            <ThreeMannequin
              shirtColor="#111111"
              designImage="https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80"
              view="front"
            />
          </div>

        </div>
      </section>

      {/* 2. HOW IT WORKS SECTION */}
      <section className="py-24 border-y border-neutral-900 light:border-zinc-200 bg-[#0A0A0A] light:bg-white relative z-10 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-widest text-[#f5f5f5] light:text-zinc-900">
              System Protocol
            </h2>
            <div className="h-[2px] w-12 bg-neon mx-auto mt-4" />
            <p className="text-xs uppercase font-mono tracking-widest text-neutral-500 mt-3">
              Three stages to custom generative streetwear
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                num: "01",
                title: "Describe Your Vision",
                desc: "Type a prompt detailing your aesthetic—whether it's cyberpunk circuitry, abstract liquid geometries, or glowing typography.",
                icon: Cpu,
              },
              {
                num: "02",
                title: "Preview in Showroom",
                desc: "Your prompt generates high-fidelity designs immediately. Wrap the texture onto our interactive 3D mannequin, rotate, and select base tee colors.",
                icon: Shield,
              },
              {
                num: "03",
                title: "Checkout & Ship",
                desc: "Choose your sizing. We print using high-density tactile plastisol ink, pack it in metallic courier shielding, and deliver worldwide.",
                icon: Truck,
              },
            ].map((step, idx) => (
              <div
                key={idx}
                className="group relative flex flex-col bg-[#111111]/30 light:bg-zinc-50 border border-neutral-900 light:border-zinc-200/80 rounded-xl p-8 transition-all duration-300 hover:bg-[#111111]/60 light:hover:bg-zinc-100/50 hover:border-neon/30 light:hover:border-violet/30"
              >
                <div className="flex justify-between items-start mb-6">
                  <span className="text-4xl font-black font-display text-neutral-800 light:text-zinc-200 group-hover:text-neon light:group-hover:text-violet transition-colors">
                    {step.num}
                  </span>
                  <div className="p-2 rounded-lg bg-neutral-900 light:bg-zinc-100 border border-neutral-800 light:border-zinc-200 text-neutral-400 light:text-zinc-500 group-hover:text-neon light:group-hover:text-violet group-hover:border-neon/30 light:group-hover:border-violet/30 transition-colors">
                    <step.icon className="h-5 w-5" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-neutral-200 light:text-zinc-800 mb-3 group-hover:text-white light:group-hover:text-zinc-950">
                  {step.title}
                </h3>
                <p className="text-xs text-neutral-500 light:text-zinc-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. TRENDING DROPS CAROUSEL */}
      <section className="py-24 bg-[#0A0A0A] light:bg-[#FAFAFA] relative z-10 overflow-hidden transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-widest text-[#f5f5f5] light:text-zinc-900">
                Trending Drops
              </h2>
              <div className="h-[2px] w-12 bg-violet mt-4" />
            </div>
            
            <div className="flex items-center gap-4 mt-6 sm:mt-0">
              <Link
                href="/products"
                className="text-xs font-semibold uppercase tracking-widest text-neutral-400 light:text-zinc-500 hover:text-neon light:hover:text-violet transition-colors flex items-center gap-1.5"
              >
                <span>See All Drops</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => scroll("left")}
                  className="p-2 rounded-lg bg-[#111111] light:bg-white border border-neutral-800 light:border-zinc-200 hover:border-neutral-700 light:hover:border-zinc-300 text-[#f5f5f5] light:text-zinc-700 hover:text-neon light:hover:text-violet transition-colors cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => scroll("right")}
                  className="p-2 rounded-lg bg-[#111111] light:bg-white border border-neutral-800 light:border-zinc-200 hover:border-neutral-700 light:hover:border-zinc-300 text-[#f5f5f5] light:text-zinc-700 hover:text-neon light:hover:text-violet transition-colors cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Carousel */}
          <div
            ref={carouselRef}
            className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory no-scrollbar"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {trendingDrops.map((product) => (
              <div
                key={product.id}
                className="flex-shrink-0 w-[280px] sm:w-[320px] snap-start bg-[#111111]/40 light:bg-white border border-neutral-900 light:border-zinc-200 hover:border-neon/30 light:hover:border-violet/30 rounded-xl overflow-hidden group transition-all duration-300"
              >
                {/* Product Image */}
                <div className="relative aspect-square w-full bg-neutral-950 light:bg-zinc-100 overflow-hidden">
                  {/* Badge */}
                  <span className="absolute top-3 left-3 z-10 text-[9px] font-mono font-bold tracking-widest uppercase bg-[#0A0A0A] light:bg-white border border-neutral-800 light:border-zinc-250 text-neon light:text-violet px-2 py-0.5 rounded">
                    {product.badge}
                  </span>
                  
                  {/* Image with zoom on hover */}
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
                    <Link
                      href={`/customize?preset=${product.id}`}
                      className="w-full text-center py-2 bg-neon text-[#0A0A0A] text-xs font-semibold rounded-lg glow-neon transition-transform"
                    >
                      Remix in Lab
                    </Link>
                  </div>
                </div>

                {/* Product Detail */}
                <div className="p-5 flex flex-col gap-2">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-500 light:text-zinc-500">
                    {product.category}
                  </span>
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-neutral-200 light:text-zinc-800 text-sm group-hover:text-white light:group-hover:text-zinc-950 transition-colors">
                      {product.name}
                    </h3>
                    <span className="font-mono text-neon light:text-violet font-bold text-sm">
                      ₹{product.price}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 light:text-zinc-650 line-clamp-2 mt-1 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 4. PRESS & SOCIAL PROOF */}
      <section className="py-24 border-t border-neutral-900 light:border-zinc-200 bg-[#0B0B0B] light:bg-zinc-50 relative z-10 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Fictional Press Logos */}
          <div className="text-center mb-16">
            <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-600 light:text-zinc-500 mb-6">
              Transmitting on standard channels
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-35 hover:opacity-50 transition-opacity">
              {["WIRED FUTURE", "NEO THREAD", "HYPEGRID", "CYBORG MONTHLY"].map((logo, idx) => (
                <span key={idx} className="font-display text-xl sm:text-2xl font-black tracking-widest text-neutral-400 light:text-zinc-600">
                  {logo}
                </span>
              ))}
            </div>
          </div>

          {/* Testimonial Quote Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            {[
              {
                quote: "The print density is insane. Standard streetwear washes off or peels; this is high-end tactile plastisol. The AI prompt customized it exactly down to the color weights. Genuinely futuristic.",
                author: "Jax V.",
                title: "Techwear Collector & Editor",
              },
              {
                quote: "I was skeptical about procedural clothing, but remixing design nodes in the 3D mannequin showroom was seamless. Shipping came inside an anti-static metallic protective sleeve. 10/10.",
                author: "Kira 0x",
                title: "Digital Art Architect",
              },
            ].map((t, idx) => (
              <div
                key={idx}
                className="bg-[#111111]/20 light:bg-white border border-neutral-900/60 light:border-zinc-200 rounded-xl p-8 flex flex-col justify-between"
              >
                <p className="text-sm font-light text-neutral-400 light:text-zinc-700 italic leading-relaxed mb-6">
                  "{t.quote}"
                </p>
                <div className="flex flex-col">
                  <span className="font-mono text-neon light:text-violet text-xs font-semibold uppercase tracking-wider">
                    {t.author}
                  </span>
                  <span className="text-[10px] text-neutral-600 light:text-zinc-500 uppercase mt-0.5">
                    {t.title}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 5. BRAND CTA BANNER */}
      <section className="relative py-28 border-t border-neutral-900 light:border-zinc-200 bg-[#0A0A0A] light:bg-white overflow-hidden z-10 transition-colors duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-neon/5 to-violet/5 pointer-events-none" />
        
        <div className="mx-auto max-w-4xl px-4 text-center flex flex-col items-center gap-6 relative z-10">
          <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-[#f5f5f5] light:text-zinc-900 leading-none">
            YOUR NEXT FAVORITE SHIRT <br />
            <span className="text-neon glow-text-neon light:text-violet">DOESN'T EXIST YET.</span>
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 light:text-zinc-650 max-w-lg font-light leading-relaxed">
            Stop wearing mass-produced templates. Access our neural customization matrices and compile your own streetwear code.
          </p>
          <Link
            href="/customize"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-neon px-8 py-4 text-sm font-semibold text-[#0A0A0A] hover:bg-[#00e6a0] transition-all duration-300 glow-neon"
          >
            <Sparkles className="h-4 w-4" />
            <span>CREATE IT NOW</span>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
