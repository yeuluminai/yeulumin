"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Sparkles, Menu, X, Sun, Moon } from "lucide-react";
import { useCartStore, getCartTotalItems } from "../store/cartStore";

export default function Navbar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Sync state safely on client side
  useEffect(() => {
    setMounted(true);
    const isLight = document.documentElement.classList.contains("light");
    setTheme(isLight ? "light" : "dark");
  }, []);

  const toggleTheme = () => {
    if (theme === "dark") {
      document.documentElement.classList.add("light");
      localStorage.setItem("theme", "light");
      setTheme("light");
    } else {
      document.documentElement.classList.remove("light");
      localStorage.setItem("theme", "dark");
      setTheme("dark");
    }
  };

  const items = useCartStore((state) => state.items);
  const cartItemCount = mounted ? getCartTotalItems(items) : 0;

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Collection", href: "/products" },
    { name: "Design Lab", href: "/customize" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-900 light:border-zinc-200 bg-[#0A0A0A]/80 light:bg-white/80 backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto flex max-w-7xl h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Logo */}
        <Link href="/" className="group flex items-center gap-3">
          <img
            src="/logos/trimmed_yeulumin ai-05.png"
            alt="Yeulumin AI Icon"
            className="h-8 w-8 object-contain transition-transform duration-300 group-hover:rotate-12"
          />
          {/* Logo Wordmark (Dark Mode) */}
          {/* <img
            src="/logos/trimmed_yeulumin ai-02.png"
            alt="Yeulumin AI Logo"
            className="h-4.5 w-auto object-contain brightness-100 group-hover:brightness-110 transition-all light:hidden"
          /> */}
          {/* Logo Wordmark (Light Mode) */}
          {/* <img
            src="/logos/trimmed_yeulumin ai-01.png"
            alt="Yeulumin AI Logo"
            className="h-4.5 w-auto object-contain transition-all hidden light:block"
          /> */}
          <p className="text-sm font-semibold tracking-wide text-neutral-400 light:text-zinc-500 group-hover:text-neon transition-colors">
            YEULUMIN AI
          </p>
        </Link>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden md:flex space-x-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium tracking-wide transition-colors duration-200 hover:text-neon ${
                  isActive
                    ? "text-neon font-semibold glow-text-neon light:text-violet"
                    : "text-neutral-400 light:text-zinc-500 hover:light:text-zinc-900"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div className="hidden md:flex items-center space-x-6">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center p-2 text-neutral-400 light:text-zinc-500 hover:text-neon light:hover:text-violet transition-colors rounded-lg focus:outline-none cursor-pointer"
            aria-label="Toggle theme"
          >
            {mounted && theme === "light" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </button>

          <Link
            href="/cart"
            className="relative flex items-center justify-center p-2 text-neutral-400 light:text-zinc-500 hover:text-neon light:hover:text-violet transition-colors"
          >
            <ShoppingBag className="h-5 w-5" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-violet text-[10px] font-bold text-white ring-2 ring-[#0A0A0A] light:ring-white animate-pulse">
                {cartItemCount}
              </span>
            )}
          </Link>

          <Link
            href="/customize"
            className="inline-flex items-center gap-2 rounded-lg bg-neon px-4 py-2 text-xs font-semibold text-[#0A0A0A] hover:bg-[#00e6a0] transition-all duration-300 glow-neon"
          >
            <Sparkles className="h-3.5 w-3.5 fill-[#0A0A0A]/20" />
            <span>DESIGN NOW</span>
          </Link>
        </div>

        {/* Mobile Menu Buttons */}
        <div className="flex items-center gap-2 md:hidden">
          {/* Mobile Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center p-2 text-neutral-400 light:text-zinc-500 hover:text-neon light:hover:text-violet transition-colors rounded-lg focus:outline-none cursor-pointer"
            aria-label="Toggle theme"
          >
            {mounted && theme === "light" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </button>

          <Link
            href="/cart"
            className="relative flex items-center justify-center p-2 text-neutral-400 light:text-zinc-500 hover:text-neon light:hover:text-violet transition-colors"
          >
            <ShoppingBag className="h-5 w-5" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-violet text-[10px] font-bold text-white ring-2 ring-[#0A0A0A] light:ring-white">
                {cartItemCount}
              </span>
            )}
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-neutral-400 light:text-zinc-500 hover:text-neon light:hover:text-violet p-2 transition-colors focus:outline-none"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-900 light:border-zinc-200 bg-[#0A0A0A] light:bg-white py-6 px-4 space-y-4 animate-fade-in">
          <nav className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-base font-medium tracking-wide transition-colors ${
                  pathname === link.href
                    ? "text-neon light:text-violet font-semibold"
                    : "text-neutral-400 light:text-zinc-500"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
          <div className="pt-4 border-t border-neutral-900 light:border-zinc-200">
            <Link
              href="/customize"
              onClick={() => setMobileMenuOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-neon py-3 text-sm font-semibold text-[#0A0A0A] glow-neon"
            >
              <Sparkles className="h-4 w-4" />
              <span>DESIGN LAB</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
