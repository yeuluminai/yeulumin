"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Send } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="w-full border-t border-neutral-200/60 bg-[#F5F6F8] pt-16 pb-8 text-[#0A0A0A]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-12 border-b border-neutral-200">
          
          {/* Brand Col */}
          <div className="flex flex-col gap-4 text-left">
            <Link href="/" className="flex items-center gap-1.5">
              <img
                src="/logos/trimmed_yeulumin ai-05.png"
                alt="Yeulumin AI Logo"
                className="h-6 w-6 object-contain"
              />
              <span className="text-sm font-black uppercase tracking-wider text-neutral-900">
                Yeulumin AI
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-neutral-500 max-w-xs">
              Futuristic streetwear calculated by artificial neural pathways. Weaving high-tech design concepts with raw, high-density apparel.
            </p>
            <div className="flex items-center gap-3 mt-2">
              <a
                href="#"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-neutral-200 text-neutral-400 hover:text-blue-600 hover:border-blue-600 transition-colors shadow-sm"
                aria-label="Instagram"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>
              <a
                href="#"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-neutral-200 text-neutral-400 hover:text-blue-600 hover:border-blue-600 transition-colors shadow-sm"
                aria-label="Twitter"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-left">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700 font-sans mb-4">
              Navigation
            </h3>
            <ul className="space-y-3">
              {[
                { name: "Home Lab", href: "/" },
                { name: "Browse Drops", href: "/products" },
                { name: "AI Customizer", href: "/customize" },
                { name: "Your Cart", href: "/cart" },
              ].map((link, idx) => (
                <li key={idx}>
                  <Link
                    href={link.href}
                    className="text-xs text-neutral-500 hover:text-blue-600 transition-colors font-semibold"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal / Info */}
          <div className="text-left">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700 font-sans mb-4">
              Info & Legal
            </h3>
            <ul className="space-y-3">
              {[
                { name: "Size Guide", href: "#" },
                { name: "Shipping & Returns", href: "#" },
                { name: "Privacy Protocol", href: "#" },
                { name: "Terms of Service", href: "#" },
              ].map((link, idx) => (
                <li key={idx}>
                  <a
                    href={link.href}
                    className="text-xs text-neutral-500 hover:text-blue-600 transition-colors font-semibold"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter / Subscription */}
          <div className="flex flex-col gap-4 text-left">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700 font-sans mb-2">
              Neural Broadcasts
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Receive notifications for experimental drops and vector updates.
            </p>
            <form onSubmit={handleSubscribe} className="relative mt-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="system@domain.com"
                className="w-full bg-white border border-neutral-200 rounded-xl py-2.5 pl-3 pr-10 text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-400 shadow-sm"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all cursor-pointer shadow-md shadow-blue-500/10"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
            {subscribed && (
              <span className="text-[10px] font-mono text-emerald-600 animate-pulse">
                System subscription established.
              </span>
            )}
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 gap-4">
          <p className="text-[10px] font-mono text-neutral-400">
            &copy; {new Date().getFullYear()} YEULUMIN AI. Powered by Neural Design Laboratories. All protocols reserved.
          </p>
          <div className="flex gap-6 text-[10px] font-mono text-neutral-400">
            <span>Server Time: {mounted ? new Date().toLocaleDateString() : ""}</span>
            <span>Origin: Chennai, IN</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
