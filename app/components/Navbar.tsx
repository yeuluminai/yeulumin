"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Sparkles, Menu, X, Search, Home, Compass, Heart, User } from "lucide-react";
import { useCartStore, getCartTotalItems } from "../store/cartStore";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync Zustand store safely on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  const { user, profile, loading, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const items = useCartStore((state) => state.items);
  const cartItemCount = mounted ? getCartTotalItems(items) : 0;

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Gallery", href: "/products" },
    { name: "Design Lab", href: "/customize" },
  ];

  const isHome = pathname === "/";

  return (
    <header className={`sticky top-0 z-40 w-full transition-all duration-300 ${isHome ? "bg-transparent border-none" : "border-b border-neutral-200/60 bg-white/80 backdrop-blur-md"}`}>
      <div className="mx-auto flex max-w-7xl h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Mobile Menu Button (Hamburger Toggle) - Shown on Left on Mobile */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-neutral-900 p-2 hover:text-neutral-600 transition-colors focus:outline-none"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Left: Brand Logo - Hidden on Mobile */}
        <Link href="/" className="group hidden md:flex items-center gap-1.5">
          <img
            src="/logos/trimmed_yeulumin ai-05.png"
            alt="Yeulumin AI Logo"
            className="h-5 w-5 object-contain transition-transform group-hover:scale-105"
          />
          <span className="text-sm font-black uppercase tracking-wider text-neutral-900">
            Yeulumin AI
          </span>
        </Link>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden md:flex space-x-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs font-bold uppercase tracking-wider transition-colors duration-200 ${
                  isActive ? "text-blue-600" : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div className="hidden md:flex items-center space-x-6">
          <Link
            href="/cart"
            className="relative flex items-center justify-center p-2 text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <ShoppingBag className="h-5 w-5" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                {cartItemCount}
              </span>
            )}
          </Link>

          {/* User Account Dropdown */}
          {!loading && mounted && (
            <div className="relative">
              {user ? (
                <>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer text-xs font-mono py-2 focus:outline-none"
                  >
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="User avatar"
                        className="h-6 w-6 rounded-full object-cover border border-neutral-200"
                      />
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-[10px] font-bold text-neutral-800">
                        {profile?.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
                      </div>
                    )}
                    <span className="max-w-[80px] truncate text-neutral-700 font-bold uppercase tracking-wide">
                      {profile?.full_name || user.email?.split("@")[0]}
                    </span>
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white border border-neutral-200 p-2 shadow-2xl z-50 flex flex-col gap-1">
                      <span className="px-3 py-1.5 text-[9px] text-neutral-400 font-mono border-b border-neutral-100 truncate">
                        {user.email}
                      </span>
                       <Link
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="px-3 py-2 text-xs text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 rounded-lg transition-colors font-medium text-left"
                      >
                        My Profile
                      </Link>
                      <Link
                        href="/collection"
                        onClick={() => setDropdownOpen(false)}
                        className="px-3 py-2 text-xs text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 rounded-lg transition-colors font-medium text-left"
                      >
                        My Collection
                      </Link>
                      {profile?.is_admin && (
                        <Link
                          href="/yeulumin-admin"
                          onClick={() => setDropdownOpen(false)}
                          className="px-3 py-2 text-xs text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 rounded-lg transition-colors font-medium text-left border-t border-neutral-100"
                        >
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          signOut();
                        }}
                        className="px-3 py-2 text-xs text-red-500 hover:bg-red-50 rounded-lg transition-colors font-medium text-left cursor-pointer border-t border-neutral-100 w-full"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href="/auth"
                  className="text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-neutral-900 transition-colors"
                >
                  SIGN IN
                </Link>
              )}
            </div>
          )}

          <Link
            href="/customize"
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-blue-500/20 hover:scale-103 transition-all duration-300"
          >
            <Sparkles className="h-3.5 w-3.5 fill-white/20" />
            <span>DESIGN LAB</span>
          </Link>
        </div>

        {/* Mobile Action Buttons - Shown on Right on Mobile */}
        <div className="flex md:hidden items-center space-x-2">
          {/* Cart Icon */}
          <Link
            href="/cart"
            className="relative flex items-center justify-center p-2 text-neutral-900 hover:text-neutral-600 transition-colors"
          >
            <ShoppingBag className="h-5 w-5" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white ring-2 ring-white">
                {cartItemCount}
              </span>
            )}
          </Link>
          
          {/* Search Icon */}
          <Link
            href="/products"
            className="p-2 text-neutral-900 hover:text-neutral-600 transition-colors"
          >
            <Search className="h-5.5 w-5.5" />
          </Link>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200/60 bg-white py-6 px-4 space-y-4 animate-fade-in shadow-xl">
          <nav className="flex flex-col space-y-4 text-left">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm font-bold uppercase tracking-wider transition-colors ${
                  pathname === link.href ? "text-blue-600" : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
          <div className="pt-4 border-t border-neutral-100 flex flex-col gap-3">
            {user && (
              <div className="flex flex-col gap-2 pb-2 text-left">
                <span className="text-[10px] text-neutral-400 font-mono truncate px-1">
                  LOGGED IN AS: {user.email}
                </span>
                <Link
                  href="/collection"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-bold uppercase tracking-wider text-neutral-600 hover:text-neutral-900 transition-colors px-1"
                >
                  My Collection
                </Link>
                {profile?.is_admin && (
                  <Link
                    href="/yeulumin-admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sm font-bold uppercase tracking-wider text-neutral-600 hover:text-neutral-900 transition-colors px-1 border-t border-neutral-100 pt-2"
                  >
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut();
                  }}
                  className="text-sm font-bold uppercase tracking-wider text-red-500 hover:text-red-600 transition-colors text-left px-1 border-t border-neutral-100 pt-2 cursor-pointer w-full"
                >
                  Sign Out
                </button>
              </div>
            )}
            {!user && !loading && (
              <Link
                href="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 py-3 text-xs font-bold uppercase tracking-wider text-neutral-600 hover:text-neutral-900 transition-all"
              >
                SIGN IN
              </Link>
            )}
            <Link
              href="/customize"
              onClick={() => setMobileMenuOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-blue-500/20"
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
