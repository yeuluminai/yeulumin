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
    <footer className="w-full border-t border-neutral-900 light:border-zinc-200 bg-[#0A0A0A] light:bg-[#FAFAFA] pt-16 pb-8 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-12 border-b border-neutral-900 light:border-zinc-200">
          
          {/* Brand Col */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-3">
              <img
                src="/logos/trimmed_yeulumin ai-05.png"
                alt="Yeulumin AI Icon"
                className="h-7 w-7 object-contain"
              />
              <span className="text-sm font-semibold tracking-wide text-neutral-300 light:text-zinc-900">
                YEULUMIN AI
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-neutral-500 max-w-xs">
              Futuristic streetwear calculated by artificial neural pathways. Weaving high-tech design concepts with raw, high-density apparel.
            </p>
            <div className="flex items-center gap-3 mt-2">
              <a
                href="#"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-950 border border-neutral-900 text-neutral-400 hover:text-neon hover:border-neon transition-colors"
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
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-950 border border-neutral-900 text-neutral-400 hover:text-neon hover:border-neon transition-colors"
                aria-label="Twitter"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a
                href="#"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-950 border border-neutral-900 text-neutral-400 hover:text-neon hover:border-neon transition-colors"
                aria-label="Youtube"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z"/>
                  <polygon points="10 15 15 12 10 9 10 15"/>
                </svg>
              </a>
              <a
                href="#"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-950 border border-neutral-900 text-neutral-400 hover:text-neon hover:border-neon transition-colors"
                aria-label="Github"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
                  <path d="M9 18c-4.51 2-5-2-7-2"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 font-display mb-4">
              Navigation
            </h3>
            <ul className="space-y-3">
              {[
                { name: "Home Lab", href: "/" },
                { name: "Browse Drops", href: "/products" },
                { name: "AI customizer", href: "/customize" },
                { name: "Your Cart", href: "/cart" },
              ].map((link, idx) => (
                <li key={idx}>
                  <Link
                    href={link.href}
                    className="text-xs text-neutral-500 hover:text-neon transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal / Info */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 font-display mb-4">
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
                    className="text-xs text-neutral-500 hover:text-neon transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter / Subscription */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 light:text-zinc-600 font-display mb-2">
              Neural Broadcasts
            </h3>
            <p className="text-xs text-neutral-500">
              Receive notifications for experimental drops and vector updates.
            </p>
            <form onSubmit={handleSubscribe} className="relative mt-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="system@domain.com"
                className="w-full bg-[#111111] light:bg-white border border-neutral-900 light:border-zinc-200 rounded-lg py-2.5 pl-3 pr-10 text-xs text-neutral-300 light:text-zinc-900 placeholder-neutral-600 light:placeholder-zinc-400 focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon transition-all"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-md bg-neon/10 border border-neon/20 hover:bg-neon hover:text-[#0A0A0A] text-neon transition-all cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
            {subscribed && (
              <span className="text-[10px] font-mono text-neon glow-text-neon animate-pulse">
                System subscription established.
              </span>
            )}
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 gap-4">
          <p className="text-[10px] font-mono text-neutral-600">
            &copy; {new Date().getFullYear()} YEULUMIN AI. Powered by Neural Design Laboratories. All protocols reserved.
          </p>
          <div className="flex gap-6 text-[10px] font-mono text-neutral-600">
            <span>Server Time: {mounted ? new Date().toLocaleDateString() : ""}</span>
            <span>Origin: Chennai, IN</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
