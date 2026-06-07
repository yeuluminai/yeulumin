"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Truck, ShieldCheck, HelpCircle } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import GrainOverlay from "../components/GrainOverlay";
import {
  useCartStore,
  getCartSubtotal,
  getCartTotalItems,
  getCartShipping,
  getCartTotal,
} from "../store/cartStore";

export default function CartPage() {
  const [mounted, setMounted] = useState(false);

  // Sync Zustand store safely on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  // Computed fields (only when mounted)
  const cartItems = mounted ? items : [];
  const subtotal = getCartSubtotal(cartItems);
  const totalItems = getCartTotalItems(cartItems);
  const shipping = getCartShipping(subtotal);
  const total = getCartTotal(subtotal, shipping);

  // Shipping progress indicator threshold
  const shippingThreshold = 999;
  const progressToFreeShipping = Math.min((subtotal / shippingThreshold) * 100, 100);
  const amountLeftForFreeShipping = Math.max(shippingThreshold - subtotal, 0);

  return (
    <div className="relative min-h-screen flex flex-col bg-[#0A0A0A] light:bg-[#FAFAFA] text-[#f5f5f5] light:text-[#0A0A0A] transition-colors duration-300">
      <GrainOverlay />
      <Navbar />

      <main className="flex-grow mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Title */}
        <div className="flex flex-col gap-2 mb-10 text-left">
          <div className="flex items-center gap-2 text-xs font-mono text-neon uppercase tracking-widest">
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>Order Manifest</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight uppercase text-white light:text-zinc-900">
            YOUR CART
          </h1>
          <div className="h-[2px] w-16 bg-neon mt-2" />
        </div>

        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT PANEL: Item List (8 columns) */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#111111]/30 light:bg-white border border-neutral-900 light:border-zinc-200 rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6 hover:border-neutral-800 light:hover:border-zinc-300 transition-colors"
                >
                  {/* Left Column: Image & Details */}
                  <div className="flex items-center gap-4">
                    {/* Item Image */}
                    <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-lg bg-neutral-950 light:bg-zinc-50 border border-neutral-900 light:border-zinc-200 overflow-hidden flex-shrink-0 relative">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    {/* Item Specs */}
                    <div className="flex flex-col gap-1.5">
                      <h3 className="font-bold text-neutral-200 light:text-zinc-800 text-sm sm:text-base">
                        {item.name}
                      </h3>
                      
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-neutral-500 light:text-zinc-500 font-mono">
                        <span className="flex items-center gap-1.5">
                          Size: <strong className="text-neutral-300 light:text-zinc-800">{item.size}</strong>
                        </span>
                        
                        {/* Base Color preview */}
                        <span className="flex items-center gap-1.5">
                          Base: 
                          <span
                            className="h-3 w-3 rounded-full border border-neutral-800 light:border-zinc-300 inline-block"
                            style={{ backgroundColor: item.color }}
                            title={item.color}
                          />
                        </span>

                        {item.style && (
                          <span className="text-neon/80 uppercase text-[9px] border border-neon/20 px-1.5 rounded">
                            {item.style}
                          </span>
                        )}
                      </div>

                      {/* Display custom prompt if present */}
                      {item.prompt && (
                        <p className="text-[10px] text-neutral-500 light:text-zinc-500 font-mono italic max-w-xs sm:max-w-md line-clamp-1 border-l border-neutral-800 light:border-zinc-200 pl-2 mt-1 leading-relaxed">
                          "{item.prompt}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Quantity and Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 border-t sm:border-t-0 pt-4 sm:pt-0 border-neutral-900/60 light:border-zinc-200">
                    
                    {/* Price in INR */}
                    <div className="font-mono text-neon light:text-violet font-bold text-sm sm:text-base sm:mb-1.5">
                      ₹{item.price * item.quantity}
                    </div>

                    {/* Quantity Selector & Delete button */}
                    <div className="flex items-center gap-3">
                      
                      {/* Quantity Stepper */}
                      <div className="flex items-center bg-neutral-950/40 light:bg-zinc-100 border border-neutral-900 light:border-zinc-200 rounded-lg">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1.5 text-neutral-500 hover:text-neon light:hover:text-violet transition-colors cursor-pointer"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-mono font-bold text-neutral-200 light:text-zinc-800">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1.5 text-neutral-500 hover:text-neon light:hover:text-violet transition-colors cursor-pointer"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Delete Action */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 rounded-lg bg-neutral-950/40 light:bg-zinc-100 border border-neutral-900 light:border-zinc-200 text-neutral-500 light:text-zinc-500 hover:text-red-500 light:hover:text-red-650 hover:border-red-950 light:hover:border-red-200 transition-colors cursor-pointer"
                        title="Remove unit"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                    </div>

                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT PANEL: Order Summary (4 columns) */}
            <div className="lg:col-span-4 flex flex-col gap-6 sticky top-28">
              
              {/* Promo Banner / Free Shipping Tracker */}
              <div className="bg-[#111111]/30 light:bg-white border border-neutral-900 light:border-zinc-200 rounded-xl p-6 flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-neutral-400 light:text-zinc-500">Free Shipping Tracker</span>
                  <span className="text-neon light:text-violet">{amountLeftForFreeShipping > 0 ? `₹${amountLeftForFreeShipping} remaining` : "Eligible"}</span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-1.5 bg-neutral-900 light:bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet to-neon transition-all duration-500"
                    style={{ width: `${progressToFreeShipping}%` }}
                  />
                </div>
                <p className="text-[10px] text-neutral-500 leading-relaxed">
                  {amountLeftForFreeShipping > 0
                    ? `Add items worth ₹${amountLeftForFreeShipping} more to qualify for free express delivery.`
                    : "Your order qualifies for free shipping protocol."}
                </p>
              </div>

              {/* Order Summary Receipt */}
              <div className="bg-[#111111]/30 light:bg-white border border-neutral-900 light:border-zinc-200 rounded-xl p-6 flex flex-col gap-4">
                <h3 className="font-display font-semibold uppercase tracking-wider text-neutral-400 light:text-zinc-500 text-xs pb-3 border-b border-neutral-900 light:border-zinc-250">
                  Summary Matrix
                </h3>

                <div className="flex flex-col gap-3 font-mono text-xs text-neutral-400 light:text-zinc-500">
                  <div className="flex justify-between">
                    <span>Items Count</span>
                    <span className="text-neutral-200 light:text-zinc-800">{totalItems} units</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-neutral-200 light:text-zinc-800">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping Freight</span>
                    <span className="text-neutral-200 light:text-zinc-800">
                      {shipping === 0 ? <span className="text-neon light:text-violet font-bold uppercase text-[10px]">Free</span> : `₹${shipping}`}
                    </span>
                  </div>
                </div>

                <div className="h-[1px] bg-neutral-900 light:bg-zinc-200 my-1" />

                <div className="flex justify-between items-baseline">
                  <span className="text-xs uppercase font-mono font-bold text-neutral-400 light:text-zinc-500">Total Protocol</span>
                  <span className="font-mono text-neon light:text-violet glow-text-neon light:glow-text-none text-xl font-bold">₹{total}</span>
                </div>

                <Link
                  href="/checkout"
                  className="w-full py-3.5 bg-neon hover:bg-[#00e6a0] text-[#0A0A0A] text-xs font-black uppercase tracking-widest rounded-lg flex items-center justify-center gap-1.5 transition-all duration-300 glow-neon font-display mt-2"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Safe Checkout Badges */}
              <div className="flex flex-col gap-3 text-[10px] font-mono text-neutral-600 pl-2">
                <div className="flex items-center gap-2">
                  <Truck className="h-3.5 w-3.5" />
                  <span>Ships in 2-4 business cycles</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>100% Encrypted Transactions</span>
                </div>
              </div>

            </div>

          </div>
        ) : (
          /* Empty State */
          <div className="border border-dashed border-neutral-900 light:border-zinc-250 rounded-xl py-24 text-center max-w-md mx-auto mt-12 flex flex-col items-center gap-6">
            <div className="relative p-4 rounded-full bg-neutral-950 light:bg-zinc-100 border border-neutral-900 light:border-zinc-200">
              <ShoppingBag className="h-8 w-8 text-neutral-700 light:text-zinc-400" />
              <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-violet animate-ping" />
            </div>
            
            <div className="flex flex-col gap-2 max-w-xs">
              <h3 className="text-base font-bold text-neutral-400 light:text-zinc-800 uppercase tracking-widest font-display">
                Cart Module Empty
              </h3>
              <p className="text-xs text-neutral-600 light:text-zinc-500 leading-relaxed">
                Your order manifest is empty. Synthesize custom streetwear designs inside the AI design customizer lab.
              </p>
            </div>

            <Link
              href="/customize"
              className="inline-flex items-center gap-2 rounded-lg bg-neon px-6 py-2.5 text-xs font-semibold text-[#0A0A0A] hover:bg-[#00e6a0] transition-all duration-300 glow-neon"
            >
              <span>Start Designing →</span>
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
