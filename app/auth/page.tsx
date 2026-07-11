"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { Sparkles, Mail, Lock, User, ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import GrainOverlay from "../components/GrainOverlay";
import { useAuth } from "../context/AuthContext";

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const { bypassLogin } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setIsConfigured(isSupabaseConfigured());
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full max-w-md bg-white border border-neutral-200/80 rounded-3xl p-8 flex flex-col items-center justify-center gap-4 min-h-[400px] relative z-10 mx-auto shadow-lg">
        <Loader2 className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-neutral-400 font-mono">ESTABLISHING CONNECTION...</span>
      </div>
    );
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfigured) {
      setErrorMsg("Supabase keys are not set. Configure process.env.NEXT_PUBLIC_SUPABASE_URL.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirect)}`,
          },
        });

        if (error) throw error;

        if (data.session) {
          // Direct login (email confirmation disabled in Supabase)
          router.push(redirect);
        } else {
          setSuccessMsg("Verification link sent! Please check your email inbox to confirm registration.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        router.push(redirect);
      }
    } catch (err: any) {
      console.error("Auth action failed:", err);
      setErrorMsg(err.message || "An error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!isConfigured) {
      setErrorMsg("Supabase keys are not set. Google OAuth requires a valid Supabase instance.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirect)}`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      console.error("Google OAuth initiation failed:", err);
      setErrorMsg(err.message || "Could not launch Google authentication.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white border border-neutral-200 rounded-3xl p-8 relative z-10 shadow-lg">
      
      {/* Tab Selectors */}
      <div className="flex bg-neutral-100 p-1 rounded-xl border border-neutral-200 mb-6">
        <button
          onClick={() => {
            setMode("signin");
            setErrorMsg(null);
            setSuccessMsg(null);
          }}
          className={`flex-1 py-2.5 text-xs font-bold uppercase rounded-lg cursor-pointer transition-all duration-200 ${
            mode === "signin"
              ? "bg-white text-black shadow-sm"
              : "text-neutral-500 hover:text-neutral-800"
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => {
            setMode("signup");
            setErrorMsg(null);
            setSuccessMsg(null);
          }}
          className={`flex-1 py-2.5 text-xs font-bold uppercase rounded-lg cursor-pointer transition-all duration-200 ${
            mode === "signup"
              ? "bg-white text-black shadow-sm"
              : "text-neutral-500 hover:text-neutral-800"
          }`}
        >
          Sign Up
        </button>
      </div>

      <div className="text-center mb-6">
        <h2 className="font-sans text-lg font-black uppercase tracking-wider text-neutral-900">
          {mode === "signin" ? "Access Studio Core" : "Create Studio Account"}
        </h2>
        <span className="text-[9px] text-neutral-400 font-mono tracking-widest uppercase block mt-1">
          Identity authentication protocol
        </span>
      </div>

      {!isConfigured && (
        <div className="mb-6 flex gap-2.5 p-3.5 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800 text-[10px] leading-relaxed">
          <AlertCircle className="h-4.5 w-4.5 text-yellow-600 flex-shrink-0" />
          <div>
            <span className="font-bold uppercase font-mono tracking-wider">Warning</span>
            <p>Supabase is not configured yet. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your local environment variables.</p>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 flex gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-800 text-[10px] leading-relaxed">
          <AlertCircle className="h-4.5 w-4.5 text-red-500 flex-shrink-0" />
          <div>
            <span className="font-bold uppercase font-mono tracking-wider">Protocol Failure</span>
            <p>{errorMsg}</p>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 flex gap-2.5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[10px] leading-relaxed">
          <Sparkles className="h-4.5 w-4.5 text-emerald-600 flex-shrink-0" />
          <div>
            <span className="font-bold uppercase font-mono tracking-wider">Protocol Initiated</span>
            <p>{successMsg}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleEmailAuth} className="flex flex-col gap-4">
        {mode === "signup" && (
          <div className="relative">
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full Name"
              className="w-full bg-white border border-neutral-200 focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400 rounded-xl py-2.5 pl-10 pr-4 text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none transition-all shadow-sm"
            />
            <User className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-400" />
          </div>
        )}

        <div className="relative">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            className="w-full bg-white border border-neutral-200 focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400 rounded-xl py-2.5 pl-10 pr-4 text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none transition-all shadow-sm"
          />
          <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-400" />
        </div>

        <div className="relative">
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Secret Code (Password)"
            className="w-full bg-white border border-neutral-200 focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400 rounded-xl py-2.5 pl-10 pr-4 text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none transition-all shadow-sm"
          />
          <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-400" />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-widest transition-all duration-200 disabled:opacity-30 disabled:pointer-events-none cursor-pointer shadow-md shadow-blue-500/20"
        >
          {loading ? "EXECUTING PROTOCOL..." : mode === "signin" ? "SIGN IN" : "REGISTER"}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-4 my-6">
        <div className="h-[1px] bg-neutral-200 flex-1" />
        <span className="text-[9px] text-neutral-400 font-mono uppercase tracking-wider">OR</span>
        <div className="h-[1px] bg-neutral-200 flex-1" />
      </div>

      {/* Social Logins */}
      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full py-3 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 font-bold text-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-sm"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        <span>AUTHENTICATE WITH GOOGLE</span>
      </button>

      {/* Bypass Login Button */}
      <button
        type="button"
        onClick={() => {
          bypassLogin();
          router.push(redirect);
        }}
        disabled={loading}
        className="w-full mt-3 py-3 rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/10 font-bold font-mono text-[9px] tracking-wider transition-all cursor-pointer flex items-center justify-center"
      >
        <span>[BYPASS PROTOCOL (DEMO ADMIN)]</span>
      </button>
    </div>
  );
}

export default function AuthPage() {
  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-[#F5F6F8] text-[#0A0A0A] overflow-hidden antialiased">
      <GrainOverlay />

      <header className="sticky top-0 z-40 w-full border-b border-neutral-200/60 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-1.5">
            <img
              src="/logos/trimmed_yeulumin ai-05.png"
              alt="Yeulumin AI Logo"
              className="h-7 w-7 object-contain shadow-sm"
            />
            <span className="text-sm font-black uppercase tracking-wider text-neutral-900">
              Yeulumin AI
            </span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[10px] font-mono uppercase text-neutral-400 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Abort Protocol</span>
          </Link>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 py-12 relative">
        {/* Background ambient light */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-blue-500/5 blur-[120px] pointer-events-none z-0" />
        
        <Suspense fallback={
          <div className="w-full max-w-md bg-white border border-neutral-200 rounded-3xl p-8 flex flex-col items-center justify-center gap-4 shadow-lg">
            <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-neutral-400 font-mono">LOADING protocol...</span>
          </div>
        }>
          <AuthForm />
        </Suspense>
      </main>

      <footer className="py-6 border-t border-neutral-200 bg-white text-center">
        <p className="text-[10px] text-neutral-400 font-mono uppercase tracking-widest">
          © 2026 Yeulumin AI. All transmission channels secured.
        </p>
      </footer>
    </div>
  );
}
