"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { CreditCard, Truck, ShieldCheck, CheckCircle2, Copy, ShoppingBag, Terminal, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import GrainOverlay from "../components/GrainOverlay";
import { useCartStore, getCartSubtotal, getCartShipping, getCartTotal } from "../store/cartStore";

// Confetti Particle Physics Simulator
function ConfettiCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const colors = ["#00FFB2", "#7B2FFF", "#ffffff", "#0047FF"];
    const particles: Array<{
      x: number;
      y: number;
      size: number;
      color: string;
      speedX: number;
      speedY: number;
      rotation: number;
      rotationSpeed: number;
      gravity: number;
      opacity: number;
    }> = [];

    // Create a rich upwards burst of neon sparks
    for (let i = 0; i < 180; i++) {
      particles.push({
        x: width / 2,
        y: height / 2 + 50,
        size: Math.random() * 7 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: (Math.random() - 0.5) * 18,
        speedY: Math.random() * -18 - 8,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        gravity: 0.38,
        opacity: 1.0,
      });
    }

    let animationFrameId: number;
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      let isAnyParticleAlive = false;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (p.opacity <= 0) continue;
        isAnyParticleAlive = true;

        p.x += p.speedX;
        p.y += p.speedY;
        p.speedY += p.gravity;
        p.rotation += p.rotationSpeed;
        p.opacity -= 0.007;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }

      if (isAnyParticleAlive) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-50" />
  );
}

export default function CheckoutPage() {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Sync state safely
  useEffect(() => {
    setMounted(true);
  }, []);

  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

  // Computed totals
  const cartItems = mounted ? items : [];
  const subtotal = getCartSubtotal(cartItems);
  const shipping = getCartShipping(subtotal);
  const total = getCartTotal(subtotal, shipping);

  // Step 1: Shipping State
  const [shippingForm, setShippingForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    pinCode: "",
    country: "India",
  });

  // Step 2: Payment State
  const [activePaymentTab, setActivePaymentTab] = useState<"upi" | "card" | "netbanking">("card");
  const [cardForm, setCardForm] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    cardName: "",
  });

  // Step 3: Success details
  const [orderId, setOrderId] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate Order ID & Delivery Date (5 business days out)
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    setOrderId(`YL-${randomNum}`);

    const estimate = new Date();
    estimate.setDate(estimate.getDate() + 5);
    setDeliveryDate(
      estimate.toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );

    // Clean cart state
    clearCart();

    // Trigger Success screen
    setStep(3);
  };

  const copyOrderId = () => {
    if (orderId) {
      navigator.clipboard.writeText(orderId);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-[#0A0A0A] light:bg-[#FAFAFA] text-[#f5f5f5] light:text-[#0A0A0A] transition-colors duration-300">
      <GrainOverlay />
      <Navbar />

      {step === 3 && <ConfettiCanvas />}

      <main className="flex-grow mx-auto max-w-4xl w-full px-4 sm:px-6 lg:px-8 py-12">
        {/* Step Indicator */}
        <div className="flex items-center justify-between max-w-md mx-auto mb-12 relative">
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-neutral-900 light:bg-zinc-200 z-0" />
          
          {[
            { num: 1, label: "Shipping" },
            { num: 2, label: "Payment" },
            { num: 3, label: "Confirm" },
          ].map((s) => {
            const isCompleted = step > s.num;
            const isActive = step === s.num;
            return (
              <div key={s.num} className="flex flex-col items-center gap-2 relative z-10">
                <span
                  className={`h-8 w-8 rounded-full border text-xs font-mono font-bold flex items-center justify-center transition-all ${
                    isCompleted
                      ? "bg-neon border-neon text-[#0A0A0A] glow-neon"
                      : isActive
                      ? "bg-[#111111] light:bg-white border-neon light:border-violet text-neon light:text-violet glow-text-neon light:glow-text-none"
                      : "bg-[#0A0A0A] light:bg-white border-neutral-800 light:border-zinc-200 text-neutral-600 light:text-zinc-400"
                  }`}
                >
                  {s.num}
                </span>
                <span
                  className={`text-[10px] uppercase font-mono tracking-wider ${
                    isActive ? "text-neon light:text-violet glow-text-neon light:glow-text-none font-bold" : "text-neutral-500 light:text-zinc-500"
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* STEP 1: SHIPPING DETAILS */}
        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 bg-[#111111]/30 light:bg-white border border-neutral-900 light:border-zinc-200 rounded-xl p-6 sm:p-8">
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400 light:text-zinc-650 font-mono mb-6 pb-3 border-b border-neutral-900 light:border-zinc-200 flex items-center gap-2">
                <Truck className="h-4 w-4 text-neon light:text-violet" />
                <span>Shipping Destination Matrix</span>
              </h2>

              <form onSubmit={handleShippingSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="font-mono text-neutral-500 light:text-zinc-500 uppercase">Full Name</label>
                  <input
                    type="text"
                    required
                    value={shippingForm.fullName}
                    onChange={(e) => setShippingForm({ ...shippingForm, fullName: e.target.value })}
                    placeholder="Jax Vandal"
                    className="bg-[#111111] light:bg-zinc-50 border border-neutral-800 light:border-zinc-200 focus:border-neon light:focus:border-violet rounded px-3 py-2 text-neutral-300 light:text-zinc-900 placeholder-neutral-700 light:placeholder-zinc-400 focus:outline-none transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-neutral-500 light:text-zinc-500 uppercase">Email Address</label>
                  <input
                    type="email"
                    required
                    value={shippingForm.email}
                    onChange={(e) => setShippingForm({ ...shippingForm, email: e.target.value })}
                    placeholder="vandal@hypegrid.com"
                    className="bg-[#111111] light:bg-zinc-50 border border-neutral-800 light:border-zinc-200 focus:border-neon light:focus:border-violet rounded px-3 py-2 text-neutral-300 light:text-zinc-900 placeholder-neutral-700 light:placeholder-zinc-400 focus:outline-none transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-neutral-500 light:text-zinc-500 uppercase">Phone Code</label>
                  <input
                    type="tel"
                    required
                    value={shippingForm.phone}
                    onChange={(e) => setShippingForm({ ...shippingForm, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="bg-[#111111] light:bg-zinc-50 border border-neutral-800 light:border-zinc-200 focus:border-neon light:focus:border-violet rounded px-3 py-2 text-neutral-300 light:text-zinc-900 placeholder-neutral-700 light:placeholder-zinc-400 focus:outline-none transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="font-mono text-neutral-500 light:text-zinc-500 uppercase">Address Line 1</label>
                  <input
                    type="text"
                    required
                    value={shippingForm.address1}
                    onChange={(e) => setShippingForm({ ...shippingForm, address1: e.target.value })}
                    placeholder="Plot 42, Cyberpunk Boulevard, Layer 3"
                    className="bg-[#111111] light:bg-zinc-50 border border-neutral-800 light:border-zinc-200 focus:border-neon light:focus:border-violet rounded px-3 py-2 text-neutral-300 light:text-zinc-900 placeholder-neutral-700 light:placeholder-zinc-400 focus:outline-none transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="font-mono text-neutral-500 light:text-zinc-500 uppercase">Address Line 2 (Optional)</label>
                  <input
                    type="text"
                    value={shippingForm.address2}
                    onChange={(e) => setShippingForm({ ...shippingForm, address2: e.target.value })}
                    placeholder="Block Neon, Sector 9"
                    className="bg-[#111111] light:bg-zinc-50 border border-neutral-800 light:border-zinc-200 focus:border-neon light:focus:border-violet rounded px-3 py-2 text-neutral-300 light:text-zinc-900 placeholder-neutral-700 light:placeholder-zinc-400 focus:outline-none transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-neutral-500 light:text-zinc-500 uppercase">City</label>
                  <input
                    type="text"
                    required
                    value={shippingForm.city}
                    onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                    placeholder="Bangalore"
                    className="bg-[#111111] light:bg-zinc-50 border border-neutral-800 light:border-zinc-200 focus:border-neon light:focus:border-violet rounded px-3 py-2 text-neutral-300 light:text-zinc-900 placeholder-neutral-700 light:placeholder-zinc-400 focus:outline-none transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-neutral-500 light:text-zinc-500 uppercase">State</label>
                  <input
                    type="text"
                    required
                    value={shippingForm.state}
                    onChange={(e) => setShippingForm({ ...shippingForm, state: e.target.value })}
                    placeholder="Karnataka"
                    className="bg-[#111111] light:bg-zinc-50 border border-neutral-800 light:border-zinc-200 focus:border-neon light:focus:border-violet rounded px-3 py-2 text-neutral-300 light:text-zinc-900 placeholder-neutral-700 light:placeholder-zinc-400 focus:outline-none transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-neutral-500 light:text-zinc-500 uppercase">PIN Code</label>
                  <input
                    type="text"
                    required
                    value={shippingForm.pinCode}
                    onChange={(e) => setShippingForm({ ...shippingForm, pinCode: e.target.value })}
                    placeholder="560001"
                    className="bg-[#111111] light:bg-zinc-50 border border-neutral-800 light:border-zinc-200 focus:border-neon light:focus:border-violet rounded px-3 py-2 text-neutral-300 light:text-zinc-900 placeholder-neutral-700 light:placeholder-zinc-400 focus:outline-none transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-neutral-500 light:text-zinc-500 uppercase">Country</label>
                  <input
                    type="text"
                    required
                    value={shippingForm.country}
                    onChange={(e) => setShippingForm({ ...shippingForm, country: e.target.value })}
                    placeholder="India"
                    className="bg-[#111111] light:bg-zinc-50 border border-neutral-800 light:border-zinc-200 focus:border-neon light:focus:border-violet rounded px-3 py-2 text-neutral-300 light:text-zinc-900 placeholder-neutral-700 light:placeholder-zinc-400 focus:outline-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="sm:col-span-2 py-3 bg-neon hover:bg-[#00e6a0] text-[#0A0A0A] font-bold uppercase tracking-widest rounded-lg flex items-center justify-center gap-1.5 transition-all glow-neon font-display text-xs cursor-pointer mt-4"
                >
                  <span>Continue to Payment</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </form>
            </div>

            {/* Billing receipt sidebar */}
            <div className="lg:col-span-4 bg-[#111111]/30 light:bg-white border border-neutral-900 light:border-zinc-200 rounded-xl p-6 flex flex-col gap-4">
              <h3 className="font-display font-semibold uppercase tracking-wider text-neutral-400 light:text-zinc-500 text-xs pb-3 border-b border-neutral-900 light:border-zinc-200">
                Order Value
              </h3>
              <div className="flex flex-col gap-3 font-mono text-xs text-neutral-500">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-neutral-300 light:text-zinc-800">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-neutral-300 light:text-zinc-800">{shipping === 0 ? "Free" : `₹${shipping}`}</span>
                </div>
              </div>
              <div className="h-[1px] bg-neutral-900 light:bg-zinc-200 my-1" />
              <div className="flex justify-between items-baseline">
                <span className="text-xs uppercase font-mono font-bold text-neutral-400 light:text-zinc-500">Total</span>
                <span className="font-mono text-neon light:text-violet glow-text-neon light:glow-text-none text-lg font-bold">₹{total}</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: MOCK PAYMENT UI */}
        {step === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 bg-[#111111]/30 light:bg-white border border-neutral-900 light:border-zinc-200 rounded-xl p-6 sm:p-8">
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400 light:text-zinc-650 font-mono mb-6 pb-3 border-b border-neutral-900 light:border-zinc-200 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-neon light:text-violet" />
                <span>Secure Payment Terminal</span>
              </h2>

              {/* Payment Tabs */}
              <div className="flex border-b border-neutral-900 light:border-zinc-200 mb-6 gap-2">
                {(["card", "upi", "netbanking"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActivePaymentTab(tab)}
                    className={`py-2 px-4 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer border-b-2 -mb-[2px] ${
                      activePaymentTab === tab
                        ? "border-neon light:border-violet text-neon light:text-violet font-bold glow-text-neon light:glow-text-none"
                        : "border-transparent text-neutral-500 light:text-zinc-500 hover:text-neutral-300 light:hover:text-zinc-800"
                    }`}
                  >
                    {tab === "card" ? "Credit/Debit Card" : tab.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Card tab form */}
              {activePaymentTab === "card" && (
                <form onSubmit={handlePaymentSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
                  <div className="flex flex-col gap-1.5 sm:col-span-3">
                    <label className="font-mono text-neutral-500 light:text-zinc-500 uppercase">Cardholder Name</label>
                    <input
                      type="text"
                      required
                      value={cardForm.cardName}
                      onChange={(e) => setCardForm({ ...cardForm, cardName: e.target.value })}
                      placeholder="JAX VANDAL"
                      className="bg-[#111111] light:bg-zinc-50 border border-neutral-800 light:border-zinc-200 focus:border-neon light:focus:border-violet rounded px-3 py-2 text-neutral-300 light:text-zinc-900 placeholder-neutral-700 light:placeholder-zinc-400 focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 sm:col-span-3">
                    <label className="font-mono text-neutral-500 light:text-zinc-500 uppercase">Card Number</label>
                    <input
                      type="text"
                      required
                      value={cardForm.cardNumber}
                      onChange={(e) => setCardForm({ ...cardForm, cardNumber: e.target.value })}
                      placeholder="4321 0987 6543 2109"
                      maxLength={19}
                      className="bg-[#111111] light:bg-zinc-50 border border-neutral-800 light:border-zinc-200 focus:border-neon light:focus:border-violet rounded px-3 py-2 text-neutral-300 light:text-zinc-900 placeholder-neutral-700 light:placeholder-zinc-400 focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="font-mono text-neutral-500 light:text-zinc-500 uppercase">Expiry Date</label>
                    <input
                      type="text"
                      required
                      value={cardForm.expiry}
                      onChange={(e) => setCardForm({ ...cardForm, expiry: e.target.value })}
                      placeholder="MM/YY"
                      maxLength={5}
                      className="bg-[#111111] light:bg-zinc-50 border border-neutral-800 light:border-zinc-200 focus:border-neon light:focus:border-violet rounded px-3 py-2 text-neutral-300 light:text-zinc-900 placeholder-neutral-700 light:placeholder-zinc-400 focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-neutral-500 light:text-zinc-500 uppercase">CVV / Security Code</label>
                    <input
                      type="password"
                      required
                      value={cardForm.cvv}
                      onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })}
                      placeholder="•••"
                      maxLength={3}
                      className="bg-[#111111] light:bg-zinc-50 border border-neutral-800 light:border-zinc-200 focus:border-neon light:focus:border-violet rounded px-3 py-2 text-neutral-300 light:text-zinc-900 placeholder-neutral-700 light:placeholder-zinc-400 focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="sm:col-span-3 flex items-center justify-between mt-4 border-t border-neutral-900 light:border-zinc-200 pt-6 gap-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-300 cursor-pointer"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span>Back to Shipping</span>
                    </button>

                    <button
                      type="submit"
                      className="py-3 px-8 bg-violet hover:bg-[#8d47ff] text-white font-bold uppercase tracking-widest rounded-lg flex items-center justify-center gap-1.5 transition-all glow-violet font-display text-xs cursor-pointer"
                    >
                      <span>Authorize Payment • ₹{total}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* UPI Tab */}
              {activePaymentTab === "upi" && (
                <div className="text-center py-10 flex flex-col items-center gap-4 text-xs font-mono">
                  <div className="p-3 bg-[#111111] light:bg-zinc-50 border border-neutral-800 light:border-zinc-200 rounded-lg text-neon light:text-violet glow-text-neon light:glow-text-none text-lg tracking-widest font-black uppercase">
                    UPI SCAN TERMINAL
                  </div>
                  <p className="text-neutral-500 light:text-zinc-500 max-w-sm leading-relaxed">
                    UPI interface mapping active. Send transaction request to: <br />
                    <strong className="text-neutral-300 light:text-zinc-800">yeulumin@ybl</strong>
                  </p>
                  <button
                    onClick={handlePaymentSubmit}
                    className="py-3 px-8 bg-violet hover:bg-[#8d47ff] text-white font-bold uppercase tracking-widest rounded-lg flex items-center justify-center gap-1.5 transition-all glow-violet font-display text-xs cursor-pointer mt-4"
                  >
                    <span>Simulate UPI Payment Success</span>
                  </button>
                </div>
              )}

              {/* Netbanking Tab */}
              {activePaymentTab === "netbanking" && (
                <div className="text-center py-10 flex flex-col items-center gap-4 text-xs font-mono">
                  <p className="text-neutral-500">
                    Netbanking redirects are encrypted using standard protocol.
                  </p>
                  <button
                    onClick={handlePaymentSubmit}
                    className="py-3 px-8 bg-violet hover:bg-[#8d47ff] text-white font-bold uppercase tracking-widest rounded-lg flex items-center justify-center gap-1.5 transition-all glow-violet font-display text-xs cursor-pointer"
                  >
                    <span>Simulate Bank Authentication Success</span>
                  </button>
                </div>
              )}

            </div>

            {/* Bill summary sidebar */}
            <div className="lg:col-span-4 bg-[#111111]/30 light:bg-white border border-neutral-900 light:border-zinc-200 rounded-xl p-6 flex flex-col gap-4">
              <h3 className="font-display font-semibold uppercase tracking-wider text-neutral-400 light:text-zinc-555 text-xs pb-3 border-b border-neutral-900 light:border-zinc-200">
                Order Value
              </h3>
              <div className="flex flex-col gap-3 font-mono text-xs text-neutral-500">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-neutral-300 light:text-zinc-800">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-neutral-300 light:text-zinc-800">{shipping === 0 ? "Free" : `₹${shipping}`}</span>
                </div>
              </div>
              <div className="h-[1px] bg-neutral-900 light:bg-zinc-200 my-1" />
              <div className="flex justify-between items-baseline">
                <span className="text-xs uppercase font-mono font-bold text-neutral-400 light:text-zinc-500">Total</span>
                <span className="font-mono text-neon light:text-violet glow-text-neon light:glow-text-none text-lg font-bold">₹{total}</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: ORDER CONFIRMATION / SUCCESS */}
        {step === 3 && (
          <div className="max-w-2xl mx-auto bg-[#111111]/30 light:bg-white border border-neutral-900 light:border-zinc-200 rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center gap-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-neon via-violet to-neon" />
            
            {/* Animated Success Ring */}
            <div className="p-4 rounded-full bg-neon/10 border border-neon/30 text-neon glow-text-neon animate-pulse">
              <CheckCircle2 className="h-12 w-12" />
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="font-display text-2xl sm:text-4xl font-extrabold uppercase tracking-wide text-white light:text-zinc-900">
                TRANSACTION COMPLETED
              </h2>
              <p className="text-xs font-mono text-neutral-500 light:text-zinc-500">
                Order compiled into dispatch matrix.
              </p>
            </div>

            {/* Order Card Detail Info */}
            <div className="w-full bg-neutral-950/60 light:bg-zinc-50 border border-neutral-900/60 light:border-zinc-200 rounded-xl p-5 flex flex-col gap-4 font-mono text-xs text-neutral-400 light:text-zinc-650 text-left">
              <div className="flex justify-between items-center pb-3 border-b border-neutral-900 light:border-zinc-200">
                <span className="text-neutral-500 light:text-zinc-500">Order ID Code:</span>
                <div className="flex items-center gap-2">
                  <span className="text-neon light:text-violet glow-text-neon light:glow-text-none font-bold">{orderId}</span>
                  <button
                    onClick={copyOrderId}
                    className="p-1 hover:text-white light:hover:text-zinc-800 transition-colors cursor-pointer"
                    title="Copy Order ID"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  {isCopied && <span className="text-[9px] text-neon light:text-violet uppercase font-bold">Copied!</span>}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <span className="text-neutral-500 light:text-zinc-500">Recipient:</span>
                  <span className="text-neutral-200 light:text-zinc-800">{shippingForm.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 light:text-zinc-500">Destination:</span>
                  <span className="text-neutral-200 light:text-zinc-800 text-right">
                    {shippingForm.city}, {shippingForm.state}, IN
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 light:text-zinc-500">Estimate Delivery:</span>
                  <span className="text-neon light:text-violet font-bold text-right">{deliveryDate}</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <button
                onClick={() => {
                  alert(`Tracking code generated. Checking logs for Order ID: ${orderId}... Shipment status: IN TRANSIT.`);
                }}
                className="flex-grow py-3 bg-[#111111] light:bg-zinc-100 border border-neutral-800 light:border-zinc-200 text-neutral-300 light:text-zinc-700 hover:border-neon light:hover:border-violet hover:text-neon light:hover:text-violet text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Terminal className="h-4 w-4" />
                <span>Track Your Order</span>
              </button>

              <Link
                href="/products"
                className="flex-grow py-3 bg-neon text-[#0A0A0A] hover:bg-[#00e6a0] text-xs font-black uppercase tracking-wider rounded-lg transition-all glow-neon font-display flex items-center justify-center"
              >
                <span>Continue Shopping →</span>
              </Link>
            </div>

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
