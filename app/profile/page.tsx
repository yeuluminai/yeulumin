"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { PRODUCTS } from "../lib/products";
import {
  User as UserIcon,
  Sparkles,
  ShoppingBag,
  Heart,
  Home as HomeIcon,
  Image as GalleryIcon,
  LogOut,
  FolderHeart,
  Settings,
  Truck,
  PhoneCall,
  Mail,
  History,
  CheckCircle2,
  Package,
  Clock,
  ArrowRight
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import GrainOverlay from "../components/GrainOverlay";

export default function ProfilePage() {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth?redirect=/profile");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center gap-3">
        <GrainOverlay />
        <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
          Authenticating Neural Link...
        </span>
      </div>
    );
  }

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase()
    : user.email?.substring(0, 2).toUpperCase() || "US";

  // Simulate recently viewed designs using template products
  const recentlyViewed = PRODUCTS.slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB] text-neutral-900 antialiased pb-24 md:pb-0">
      <GrainOverlay />
      
      <Navbar />

      <main className="flex-grow max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
        
        {/* Profile Card Section */}
        <section className="bg-white border border-neutral-200/80 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
          {/* Neon background accent */}
          <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-blue-500/5 blur-3xl" />
          
          {/* Avatar Ring */}
          <div className="relative">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name || "User Avatar"}
                className="h-24 w-24 rounded-2xl object-cover border border-neutral-200 shadow"
              />
            ) : (
              <div className="h-24 w-24 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center text-3xl font-black shadow-md shadow-blue-500/20">
                {initials}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-emerald-500 rounded-full border-2 border-white" title="Active Connection" />
          </div>

          {/* User Details info */}
          <div className="flex-grow text-center md:text-left space-y-1">
            <h1 className="text-xl font-display font-black uppercase tracking-wider text-neutral-900 flex items-center justify-center md:justify-start gap-2">
              <span>{profile?.full_name || "Yeulumin User"}</span>
              {profile?.is_admin && (
                <span className="text-[8px] font-mono font-bold tracking-widest bg-blue-50 border border-blue-200 text-blue-600 px-2 py-0.5 rounded-full uppercase">
                  Admin
                </span>
              )}
            </h1>
            <p className="text-xs text-neutral-500 font-mono select-all">
              {user.email}
            </p>
            <p className="text-[10px] text-neutral-400 uppercase tracking-widest pt-2">
              Synchronized since: {user.created_at ? new Date(user.created_at).toLocaleDateString() : "Active Connection"}
            </p>
          </div>

          {/* User Management buttons */}
          <div className="flex md:flex-col gap-2.5 w-full md:w-auto border-t border-neutral-100 md:border-t-0 pt-4 md:pt-0">
            {profile?.is_admin && (
              <Link
                href="/yeulumin-admin"
                className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors"
              >
                <Settings className="h-4 w-4" />
                <span>Admin Panel</span>
              </Link>
            )}
            <button
              onClick={() => signOut()}
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-100/50 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </section>

        {/* ─── TRACK ORDER SECTION ─── */}
        <section className="bg-white border border-neutral-200/80 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-6 text-left">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-black uppercase tracking-wider text-neutral-800">
                  Track Active Order
                </h2>
                <span className="text-[10px] font-mono text-neutral-400">Order ID: #YL-84092</span>
              </div>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full uppercase tracking-wider">
              In Transit
            </span>
          </div>

          {/* Tracking timeline */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2">
            
            {/* Step 1: Placed */}
            <div className="flex md:flex-col gap-3 items-start relative">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-50 text-blue-600 border border-blue-200 z-10">
                <CheckCircle2 className="h-4 w-4 fill-current text-white bg-blue-600 rounded-full" />
              </div>
              <div className="text-left md:pt-2">
                <h4 className="text-xs font-bold text-neutral-800">Order Placed</h4>
                <p className="text-[10px] text-neutral-400 font-mono mt-0.5">July 10, 10:24 AM</p>
              </div>
              <div className="hidden md:block absolute left-8 top-4 w-[calc(100%-2rem)] h-[2px] bg-blue-600" />
            </div>

            {/* Step 2: Dispatched */}
            <div className="flex md:flex-col gap-3 items-start relative">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-50 text-blue-600 border border-blue-200 z-10">
                <CheckCircle2 className="h-4 w-4 fill-current text-white bg-blue-600 rounded-full" />
              </div>
              <div className="text-left md:pt-2">
                <h4 className="text-xs font-bold text-neutral-800">Dispatched</h4>
                <p className="text-[10px] text-neutral-400 font-mono mt-0.5">July 11, 04:15 PM</p>
              </div>
              <div className="hidden md:block absolute left-8 top-4 w-[calc(100%-2rem)] h-[2px] bg-blue-600" />
            </div>

            {/* Step 3: In Transit */}
            <div className="flex md:flex-col gap-3 items-start relative">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white border-2 border-blue-600 z-10 animate-pulse">
                <Clock className="h-4 w-4" />
              </div>
              <div className="text-left md:pt-2">
                <h4 className="text-xs font-bold text-neutral-900">In Transit</h4>
                <p className="text-[10px] text-neutral-400 font-mono mt-0.5">Delhi Logistics Hub</p>
              </div>
              <div className="hidden md:block absolute left-8 top-4 w-[calc(100%-2rem)] h-[2px] bg-neutral-200" />
            </div>

            {/* Step 4: Delivery */}
            <div className="flex md:flex-col gap-3 items-start">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-neutral-100 text-neutral-400 border border-neutral-200 z-10">
                <Package className="h-4 w-4" />
              </div>
              <div className="text-left md:pt-2">
                <h4 className="text-xs font-bold text-neutral-400">Delivery Est.</h4>
                <p className="text-[10px] text-neutral-400 font-mono mt-0.5">July 14, 2026</p>
              </div>
            </div>

          </div>
        </section>

        {/* ─── RECENTLY VIEWED DESIGNS ─── */}
        <section className="flex flex-col gap-4 text-left">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-base font-black uppercase tracking-wider text-neutral-800">
              Recently Viewed Designs
            </h2>
            <div className="h-[2px] w-6 bg-neutral-800" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {recentlyViewed.map((prod) => (
              <div
                key={prod.id}
                className="bg-white border border-neutral-200/80 rounded-2xl overflow-hidden group flex flex-col justify-between transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <div className="relative aspect-square w-full bg-[#F9FAFB] flex items-center justify-center p-4">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-103"
                  />
                </div>
                <div className="p-4 border-t border-neutral-50 flex items-center justify-between">
                  <div className="text-left max-w-[70%]">
                    <h4 className="font-bold text-neutral-800 text-xs truncate">
                      {prod.name}
                    </h4>
                    <span className="text-[9px] text-neutral-400 font-mono">₹{prod.price}</span>
                  </div>
                  <Link
                    href={`/customize?preset=${prod.id}`}
                    className="h-7 w-7 rounded-full bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                    title="Load Design"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── CONTACT & SUPPORT HELPLINES ─── */}
        <section className="bg-white border border-neutral-200/80 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-6 text-left">
          <div className="flex items-center gap-2.5 border-b border-neutral-100 pb-4">
            <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <PhoneCall className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-neutral-800">
                Contact & Support Matrix
              </h2>
              <p className="text-[10px] text-neutral-400 mt-0.5">Need help with custom apparel orders or design nodes?</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Contact Method 1 */}
            <a
              href="mailto:support@yeulumin.ai"
              className="flex items-center gap-4 p-4 border border-neutral-100 rounded-2xl hover:border-blue-500 hover:bg-neutral-50/50 transition-all group"
            >
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Mail className="h-5 w-5" />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">Email Dispatch</h4>
                <p className="text-[10px] text-neutral-400 font-mono mt-0.5">support@yeulumin.ai</p>
              </div>
            </a>

            {/* Contact Method 2 */}
            <a
              href="https://wa.me/919999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 border border-neutral-100 rounded-2xl hover:border-emerald-500 hover:bg-neutral-50/50 transition-all group"
            >
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <PhoneCall className="h-5 w-5" />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">WhatsApp Neural Link</h4>
                <p className="text-[10px] text-neutral-400 font-mono mt-0.5">+91 99999 99999</p>
              </div>
            </a>

          </div>
        </section>

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
          className="flex flex-col items-center gap-1 text-neutral-400 hover:text-neutral-900 transition-colors py-1.5 px-3"
        >
          <Heart className="h-5 w-5" />
          <span className="text-[9px] uppercase tracking-wider font-semibold">Wishlist</span>
        </Link>

        <Link
          href="/profile"
          className="flex flex-col items-center gap-1 text-neutral-400 hover:text-neutral-900 transition-colors py-1.5 px-3 relative"
        >
          <UserIcon className="h-5 w-5 text-neutral-900 fill-current" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-900">Profile</span>
          <div className="absolute bottom-0 h-1.5 w-1.5 rounded-full bg-emerald-500" />
        </Link>

      </nav>

    </div>
  );
}
