"use client";

import React, { useState, useEffect, useRef, ReactNode } from "react";
import {
  Sparkles,
  Users,
  Rocket,
  Palette,
  FileText,
  BarChart3,
  LineChart,
  Wallet,
  Brain,
  ShieldCheck,
  CheckCircle2,
  Zap,
  Lock,
  Menu,
  X,
  ArrowRight,
  Star,
  Moon,
  Sun
} from "lucide-react";

const Linkedin = ({ size = 24, className }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const Instagram = ({ size = 24, className }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const Github = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

// ---------- Custom Hooks ----------
function useInView(threshold = 0.15): [React.RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        obs.disconnect();
      }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return [ref, inView];
}

function useCountUp(target: number, trigger: boolean, duration = 1200): number {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let start: number | null = null;
    let frame: number;
    function step(ts: number) {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setVal(Math.floor(progress * target));
      if (progress < 1) {
        frame = requestAnimationFrame(step);
      }
    }
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [trigger, target, duration]);
  return val;
}

// ---------- Components ----------
function Reveal({ children }: { children: ReactNode }) {
  const [ref, inView] = useInView(0.15);
  return (
    <div ref={ref} className={`reveal ${inView ? "reveal-visible" : ""}`}>
      {children}
    </div>
  );
}

function SectionHeading({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string; }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <div className="bb-display mb-3 text-xs uppercase" style={{ color: "var(--purple)", letterSpacing: "0.2em" }}>
        {eyebrow}
      </div>
      <h2 className="bb-display text-2xl font-semibold sm:text-3xl">{title}</h2>
      {subtitle && <p className="mt-3 text-sm" style={{ color: "var(--ink-soft)" }}>{subtitle}</p>}
    </div>
  );
}

function BrandCard({ name, tag, from, to }: { name: string, tag: string, from: string, to: string }) {
  return (
    <div className="bb-glass relative z-10 shadow-lg cursor-default flex flex-col items-center justify-center p-3 text-center" style={{ borderRadius: 16, width: 110 }}>
      <div style={{ width: 28, height: 28, borderRadius: 10, background: `linear-gradient(135deg,${from},${to})`, marginBottom: 8, boxShadow: `0 4px 12px ${from}40` }} />
      <div className="bb-display" style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", lineHeight: 1.2 }}>{name}</div>
      <div className="bb-mono tracking-wide" style={{ fontSize: 9, color: "var(--ink-faint)", marginTop: 4, textTransform: "uppercase" }}>{tag}</div>
    </div>
  );
}

function StoryHeroVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cost, setCost] = useState(0);

  // Animate the cost split to 25k on load
  useEffect(() => {
    let start = 0;
    const target = 25000;
    const increment = target / (1500 / 16); // 1.5 seconds calculation
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCost(target);
        clearInterval(timer);
      } else {
        setCost(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    containerRef.current.style.transform = `perspective(1000px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
  };

  const handleMouseLeave = () => {
    if (containerRef.current) {
      containerRef.current.style.transform = `perspective(1000px) rotateY(0deg) rotateX(0deg)`;
    }
  };

  return (
    <div
      className="relative w-full h-[540px] flex items-center justify-center py-4 mt-8 lg:mt-0 transition-transform ease-out duration-300"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background container representing the canvas */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#8B5CF6]/5 to-transparent rounded-[40px] border border-[var(--border)] transition-opacity hover:opacity-80" />

      {/* Background orbs */}
      <div className="absolute bb-orb" style={{ background: "#6C63FF", width: 300, height: 300, top: "0%", right: "10%", opacity: 0.15 }} />
      <div className="absolute bb-orb" style={{ background: "#FF6B4A", width: 250, height: 250, bottom: "10%", left: "10%", opacity: 0.1 }} />

      {/* Downward processing pipeline line */}
      <div className="absolute left-1/2 top-10 bottom-10 w-[2px] bg-gradient-to-b from-transparent via-[var(--border)] to-transparent overflow-hidden transform -translate-x-1/2 z-0">
        <div className="w-full h-1/3 bg-gradient-to-b from-transparent via-[#6C63FF] to-transparent animate-flowDown" />
      </div>

      <div className="relative w-full max-w-sm h-full flex flex-col items-center justify-between py-6 z-10 pointer-events-none">

        {/* Step 1: Matching Brands */}
        <div className="flex gap-4 items-center w-full justify-center">
          <BrandCard name="Brand A" tag="(Coffee)" from="#6C63FF" to="#8B5CF6" />
          <div className="bb-glass-intense rounded-full px-3 py-1.5 flex flex-col items-center justify-center border border-[var(--purple)]/30 shrink-0 text-center shadow-lg bg-[var(--surface-strong)] pointer-events-auto cursor-help hover:scale-110 transition-transform">
            <div className="text-[9px] font-bold uppercase tracking-wider text-[var(--ink-soft)]">AI Matching</div>
            <div className="font-bold text-sm text-[var(--purple)] mt-0.5">94%</div>
          </div>
          <BrandCard name="Brand B" tag="(Bakery)" from="#FF6B4A" to="#FFB088" />
        </div>

        {/* Down Arrow UI */}
        <div className="w-6 h-6 rounded-full bg-[var(--surface-strong)] border border-[var(--border)] flex items-center justify-center shrink-0 animate-slowBob shadow-md z-10">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-[var(--ink-soft)]"><path d="M12 5v14M19 12l-7 7-7-7" /></svg>
        </div>

        {/* Step 2: Generation */}
        <div className="bb-glass-intense transition-transform rounded-[20px] p-4 w-[280px] flex items-center justify-center gap-3 shadow-xl border border-[var(--border)] bg-[var(--surface-strong)] pointer-events-auto hover:scale-105 cursor-pointer hover:shadow-2xl hover:border-[#6C63FF]/30">
          <Sparkles size={20} className="text-[#6C63FF]" />
          <div className="font-bold text-sm text-[var(--ink)] tracking-wide">AI Generates Campaign</div>
        </div>

        <div className="w-6 h-6 rounded-full bg-[var(--surface-strong)] border border-[var(--border)] flex items-center justify-center shrink-0 animate-slowBob shadow-md z-10" style={{ animationDelay: '0.2s' }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-[var(--ink-soft)]"><path d="M12 5v14M19 12l-7 7-7-7" /></svg>
        </div>

        {/* Step 3: Distribution */}
        <div className="grid grid-cols-2 gap-3 w-full pointer-events-auto">
          <div className="bb-glass transition-transform px-4 py-3 rounded-[14px] flex items-center gap-2.5 shadow-sm border border-[var(--border)] hover:-translate-y-2 cursor-pointer hover:shadow-xl hover:border-[#6C63FF]/30">
            <Instagram size={14} className="text-pink-500" /> <span className="text-[11px] font-bold text-[var(--ink)]">Instagram Ad</span>
          </div>
          <div className="bb-glass transition-transform px-4 py-3 rounded-[14px] flex items-center gap-2.5 shadow-sm border border-[var(--border)] hover:-translate-y-2 cursor-pointer hover:shadow-xl hover:border-[#6C63FF]/30">
            <div className="text-blue-600 font-bold text-[14px] ml-0.5">f</div> <span className="text-[11px] font-bold text-[var(--ink)]">Facebook Ad</span>
          </div>
          <div className="bb-glass transition-transform px-4 py-3 rounded-[14px] flex items-center gap-2.5 shadow-sm border border-[var(--border)] hover:-translate-y-2 cursor-pointer hover:shadow-xl hover:border-[#6C63FF]/30">
            <Linkedin size={14} className="text-blue-500" /> <span className="text-[11px] font-bold text-[var(--ink)]">LinkedIn</span>
          </div>
          <div className="bb-glass transition-transform px-4 py-3 rounded-[14px] flex items-center gap-2.5 shadow-sm border border-[var(--border)] hover:-translate-y-2 cursor-pointer hover:shadow-xl hover:border-[#6C63FF]/30">
            <span className="text-green-500 font-bold ml-0.5" style={{ fontSize: 13 }}>G</span> <span className="text-[11px] font-bold text-[var(--ink)]">Google Ads</span>
          </div>
        </div>

        <div className="w-6 h-6 rounded-full bg-[var(--surface-strong)] border border-[var(--border)] flex items-center justify-center shrink-0 animate-slowBob shadow-md z-10" style={{ animationDelay: '0.4s' }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-[var(--ink-soft)]"><path d="M12 5v14M19 12l-7 7-7-7" /></svg>
        </div>

        {/* Step 4: Split */}
        <div className="bb-glass-intense transition-transform rounded-[16px] p-4 w-[280px] flex items-center justify-between shadow-xl border border-[var(--border)] bg-[var(--surface-strong)] pointer-events-auto cursor-default hover:scale-105 hover:shadow-2xl">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-soft)] w-[80px]">Cost Split</div>
          <div className="flex gap-2 font-black tracking-tight" style={{ fontSize: 15, color: "var(--ink)" }}>
            <span className="text-[#6C63FF]">₹{cost.toLocaleString()}</span>
            <span className="text-[var(--ink-faint)]">+</span>
            <span className="text-[#FF6B4A]">₹{cost.toLocaleString()}</span>
          </div>
        </div>

        <div className="w-6 h-6 rounded-full bg-[var(--surface-strong)] border border-[var(--border)] flex items-center justify-center shrink-0 animate-slowBob shadow-md z-10" style={{ animationDelay: '0.6s' }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-[var(--ink-soft)]"><path d="M12 5v14M19 12l-7 7-7-7" /></svg>
        </div>

        {/* Step 5: Live */}
        <div className="bb-glass-intense bb-pulse-ring cursor-pointer pointer-events-auto hover:scale-110 transition-transform rounded-full px-6 py-3 flex items-center gap-2.5 shadow-2xl shadow-green-500/20 border border-green-500/40 bg-green-50/70 backdrop-blur-md relative z-10">
          <Rocket size={16} className="text-green-600 animate-bounce" style={{ animationDuration: "2s" }} />
          <div className="text-sm font-bold tracking-wide text-green-700">Campaign Live 🚀</div>
        </div>

      </div>
    </div>
  );
}

function ValueBand() {
  return (
    <section style={{ position: "relative", overflow: "hidden", padding: "72px 20px", marginTop: 24 }}>
      <div className="bb-dot-grid" style={{ opacity: 0.6 }} />
      <div className="bb-sweep" style={{ position: "absolute", top: "-30%", left: "-10%", width: "60%", height: "160%", background: "radial-gradient(circle,rgba(255,107,74,0.14),transparent 65%)", pointerEvents: "none" }} />
      <div className="bb-sweep" style={{ position: "absolute", top: "-20%", right: "-10%", width: "55%", height: "150%", background: "radial-gradient(circle,rgba(79,140,255,0.14),transparent 65%)", pointerEvents: "none", animationDelay: "3s" }} />
      <div style={{ position: "relative", maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
        <div className="bb-mono" style={{ fontSize: 12, color: "var(--purple)", textTransform: "uppercase", marginBottom: 14 }}>Why BrandBridge</div>
        <h2 className="bb-display" style={{ fontSize: "clamp(1.7rem,3.4vw,2.6rem)", fontWeight: 600, lineHeight: 1.18, color: "var(--ink)" }}>
          Your next customer already trusts another brand.<br />We make the introduction.
        </h2>
        <p style={{ marginTop: 18, fontSize: 15, lineHeight: 1.65, color: "var(--ink-soft)" }}>
          BrandBridge pairs you with brands whose audience already overlaps with yours — so your next campaign starts with borrowed trust, not a cold audience.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 26, flexWrap: "wrap" }}>
          <span className="bb-glass bb-mono" style={{ borderRadius: 999, padding: "8px 16px", fontSize: 11.5 }}>AI-powered matching</span>
          <span className="bb-glass bb-mono" style={{ borderRadius: 999, padding: "8px 16px", fontSize: 11.5 }}>Verified brand profiles</span>
        </div>
      </div>
    </section>
  );
}


// ---------- Data ----------
const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "About", href: "#about" },
];

const features = [
  { icon: Sparkles, title: "AI Brand Matching", desc: "Get paired with brands whose audience and values line up." },
  { icon: Users, title: "Brand Collaboration", desc: "Run joint campaigns instead of competing for budget." },
  { icon: Rocket, title: "Product Promotion", desc: "Get an established brand to promote your product." },
  { icon: Palette, title: "Freelancer Marketplace", desc: "Hire vetted designers, editors, and writers directly." },
  { icon: FileText, title: "AI Proposal Generator", desc: "Skip the blank page — AI drafts the outreach email." },
  { icon: BarChart3, title: "Campaign Management", desc: "Track every active collaboration from one dashboard." },
];

const steps = [
  { n: "01", title: "Register", desc: "Pick your role — brand, product owner, or freelancer." },
  { n: "02", title: "AI Finds Best Match", desc: "Gemini scores compatibility across audience, industry, and goals." },
  { n: "03", title: "Send Collaboration Request", desc: "Review the AI's pick and send a request in one click." },
  { n: "04", title: "Brand Accepts", desc: "The other brand reviews the AI-drafted proposal and accepts." },
  { n: "05", title: "Hire Freelancer", desc: "Bring in a freelancer from the marketplace to build creatives." },
  { n: "06", title: "Campaign Launch", desc: "Everyone's aligned, and the campaign goes live." },
];

const whyChoose = [
  { icon: Wallet, title: "Lower Marketing Cost", desc: "Split reach and budget instead of paying for an audience." },
  { icon: Brain, title: "AI-Powered Matching", desc: "Compatibility scoring removes the guesswork from outreach." },
  { icon: ShieldCheck, title: "Verified Brands", desc: "Every brand profile is reviewed before it appears in matches." },
  { icon: CheckCircle2, title: "Verified Freelancers", desc: "Portfolios and experience are checked before freelancers." },
];

const testimonials = [
  { name: "Aarav Mehta", role: "Co-founder, Solace Audio", quote: "We found a fitness brand to co-launch with in under a week. The AI's proposal draft needed two edits." },
  { name: "Priya Nair", role: "Marketing Lead, Petal Skincare", quote: "Hiring a freelancer straight out of a matched collaboration meant we never briefed from zero." },
  { name: "Karan Shah", role: "Founder, Northwind Foods", quote: "The compatibility score actually matched our gut instinct, which is rare for a recommendation engine." },
];

export default function BrandBridgeLanding() {
  const [dark, setDark] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className={`bb-root ${dark ? "bb-dark" : "bb-light"}`}>

      {/* Navbar Wrapper */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, padding: scrolled ? "10px 16px 0" : "18px 16px 0", transition: "padding .35s ease" }}>
        <nav className={`bb-nav-bar ${scrolled ? "scrolled" : ""}`} style={{ maxWidth: 1080, margin: "0 auto", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "space-between", borderRadius: 18, padding: scrolled ? "10px 18px" : "14px 20px" }}>

          <div className="bb-display" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 18, fontWeight: 600 }}>
            <span style={{ width: 32, height: 32, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#8b5cf6,#4f8cff)" }}>
              <Sparkles size={16} color="#fff" />
            </span>
            <span className="bb-grad-text">BrandBridge</span>
            <span style={{ fontSize: 13, fontWeight: 400, color: "var(--ink-faint)" }}>AI</span>
          </div>

          <div className="hidden md:flex" style={{ alignItems: "center", gap: 26, fontSize: 14, color: "var(--ink-soft)" }}>
            {navLinks.map((l) => (
              <a key={l.label} href={l.href} style={{ color: "inherit", textDecoration: "none" }} className="hover:text-[var(--ink)] transition">{l.label}</a>
            ))}
          </div>

          <div className="hidden md:flex" style={{ alignItems: "center", gap: 14 }}>
            <button onClick={() => setDark(!dark)} className="bb-glass bb-focus" style={{ width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--ink)" }}>
              {dark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <a href="/login" style={{ fontSize: 14, color: "var(--ink-soft)", textDecoration: "none" }} className="hover:text-[var(--ink)] transition">Login</a>
            <a href="/signup" className="bb-btn-orange bb-focus" style={{ borderRadius: 10, padding: "9px 18px", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Sign Up</a>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <button onClick={() => setDark(!dark)} className="bb-glass bb-focus" style={{ width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--ink)" }}>
              {dark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <button className="bb-focus bg-transparent border-none text-[var(--ink)]" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>

        {menuOpen && (
          <div className="md:hidden border border-[var(--border)] shadow-2xl" style={{ backgroundColor: "var(--bg)", maxWidth: 1080, margin: "8px auto 0", borderRadius: 16, padding: 18, display: "flex", flexDirection: "column", gap: 12, fontSize: 14 }}>
            {navLinks.map((l) => (
              <a key={l.label} href={l.href} style={{ color: "var(--ink-soft)", textDecoration: "none" }}>{l.label}</a>
            ))}
            <div style={{ display: "flex", gap: 10, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
              <a href="/login" style={{ flex: 1, padding: 8, borderRadius: 8, border: "1px solid var(--border)", textAlign: "center", color: "var(--ink)", textDecoration: "none" }}>
                Login
              </a>
              <a href="/signup" className="bb-btn-orange" style={{ flex: 1, textAlign: "center", padding: 8, borderRadius: 8, textDecoration: "none" }}>Sign Up</a>
            </div>
          </div>
        )}
      </div>

      {/* Hero Section */}
      <section style={{ position: "relative", width: "100%", overflow: "hidden", padding: "56px 0 40px" }}>
        {/* Full width background decorations */}
        <div className="bb-dot-grid" style={{ opacity: 0.5 }} />
        <div className="bb-orb" style={{ background: "#8b5cf6", width: 400, height: 400, left: "5%", top: 0, opacity: 0.15 }} />

        {/* Centered Content Wrapper */}
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 20px", position: "relative", zIndex: 1 }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="bb-glass-intense" style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 999, padding: "7px 14px", fontSize: 12.5, color: "var(--ink-soft)", marginBottom: 22, border: "1px solid rgba(0,0,0,0.05)" }}>
                <Sparkles size={13} style={{ color: "var(--purple)" }} />
                Built for brands that collaborate smarter
              </div>
              <h1 className="bb-display tracking-tight" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, lineHeight: 1.1, color: "var(--ink)" }}>
                Connect Brands.<br />Discover Partnerships.<br />
                <span className="bb-grad-text block mt-1 pb-1" style={{ background: "linear-gradient(135deg, #6C63FF, #8B5CF6, #FF6B4A)", WebkitBackgroundClip: "text", color: "transparent" }}>Launch AI Campaigns.</span>
              </h1>
              <p className="mt-6 text-base sm:text-lg font-medium" style={{ lineHeight: 1.6, color: "var(--ink-soft)", maxWidth: 520 }}>
                BrandBridge AI helps businesses discover the perfect collaboration partners, generate high-converting advertisements with AI, and reduce marketing costs through shared campaigns.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 32 }}>
                <a href="/signup" className="bb-focus bg-[#6C63FF] hover:bg-[#5a54db] transition shadow-xl shadow-[#6C63FF]/20 text-white" style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 16, padding: "12px 24px", fontSize: 14.5, fontStyle: "normal", fontWeight: 600, textDecoration: "none" }}>
                  Get Started <ArrowRight size={16} />
                </a>
                <a href="#features" className="bb-glass bb-focus hover:bg-[var(--surface-strong)] transition font-semibold" style={{ borderRadius: 16, padding: "12px 24px", fontSize: 14.5, color: "var(--ink)", textDecoration: "none" }}>
                  Explore Platform
                </a>
              </div>
            </div>
            <StoryHeroVisual />
          </div>
        </div>
      </section>

      {/* Logos & Stats */}
      {/* <div className="w-full border-b border-[var(--border)] pt-16 pb-16 relative">
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <p className="text-center text-xs font-bold tracking-[0.2em] uppercase mb-12" style={{ color: "var(--ink-faint)" }}>Trusted by Innovative Brands</p>
          <div className="flex flex-wrap items-center justify-center gap-10 sm:gap-20 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition duration-500">
            <div className="text-xl sm:text-2xl font-bold font-sans">Acme Corp</div>
            <div className="text-xl sm:text-2xl font-bold font-serif">Aura</div>
            <div className="text-xl sm:text-2xl font-bold font-mono">Quantum</div>
            <div className="text-xl sm:text-2xl font-bold bb-display">NexGen</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center mt-20 pt-16 border-t border-[var(--border)]/30">
            <div>
              <div className="text-3xl font-bold bb-display mb-2 text-[#6C63FF]">10,000+</div>
              <div className="text-sm font-medium" style={{ color: "var(--ink-soft)" }}>AI Matches Successfully Paired</div>
            </div>
            <div>
              <div className="text-3xl font-bold bb-display mb-2 text-[#FF6B4A]">₹25M+</div>
              <div className="text-sm font-medium" style={{ color: "var(--ink-soft)" }}>Marketing Costs Saved Together</div>
            </div>
            <div>
              <div className="text-3xl font-bold bb-display mb-2 text-[#8B5CF6]">98%</div>
              <div className="text-sm font-medium" style={{ color: "var(--ink-soft)" }}>Successful Collaborative Partnerships</div>
            </div>
          </div>
        </div>
      </div> */}

      {/* Value Band */}
      <ValueBand />

      {/* Features */}
      <Reveal>
        <section id="features" className="mx-auto max-w-6xl px-5 py-20 sm:px-6 relative">
          <div className="bb-orb" style={{ background: "#4f8cff", width: 350, height: 350, right: "-10%", top: "20%", opacity: 0.15, animationDelay: "1s" }} />
          <SectionHeading eyebrow="Platform" title="Everything a collaboration needs" subtitle="End to end workflows to ensure high engagement and successful creative campaigns." />
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 relative z-10">
            {features.map((f) => (
              <div key={f.title} className="bb-glass-intense relative rounded-[24px] p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(108,99,255,0.15)] hover:border-[#6C63FF]/30 cursor-pointer group">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#6C63FF]/10 text-[#6C63FF] transition-transform duration-300 group-hover:scale-110 group-hover:bg-[#6C63FF] group-hover:text-white">
                  <f.icon size={22} className="transition-colors" />
                </div>
                <h3 className="bb-display text-lg font-bold" style={{ color: "var(--ink)" }}>{f.title}</h3>
                <p className="mt-2 text-[15px] font-medium leading-relaxed" style={{ color: "var(--ink-soft)" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* How It Works */}
      <Reveal>
        <section id="how-it-works" className="mx-auto max-w-3xl px-5 py-20 sm:px-6 relative">
          <div className="bb-orb" style={{ background: "#FF6B4A", width: 400, height: 400, left: "-30%", top: "10%", opacity: 0.12, animationDelay: "3s" }} />
          <SectionHeading eyebrow="Process" title="From sign-up to launch in six steps" />

          <div className="relative mt-16 space-y-4 pl-10 z-10">
            {/* Darker Timeline Track */}
            <div className="absolute left-[23px] top-6 bottom-6 w-[2px] bg-[var(--border)] rounded-full" />
            {/* Animated Flowing Energy */}
            <div className="absolute left-[23px] top-6 bottom-6 w-[2px] overflow-hidden rounded-full">
              <div className="w-full h-1/3 bg-gradient-to-b from-transparent via-[#6C63FF] to-transparent animate-flowDown" style={{ animationDuration: '4s' }} />
            </div>

            {steps.map((s, i) => (
              <div key={s.n} className="relative group cursor-pointer pt-4 pb-4">
                {/* Node Number */}
                <div className="bb-display absolute flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-bold text-white transition-all duration-300 group-hover:scale-125 group-hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] z-10" style={{ background: "linear-gradient(135deg,#8b5cf6,#4f8cff)", left: "-48px", top: "50%", transform: "translateY(-50%)" }}>
                  {i + 1}
                </div>
                {/* Content Box */}
                <div className="bb-glass-intense transition-all duration-300 group-hover:translate-x-3 group-hover:shadow-2xl p-6 rounded-2xl border border-transparent group-hover:border-[#6C63FF]/30">
                  <div className="text-[11px] font-black tracking-widest uppercase mb-1" style={{ color: "#6C63FF" }}>{s.n}</div>
                  <h3 className="bb-display mt-1 text-xl font-bold" style={{ color: "var(--ink)" }}>{s.title}</h3>
                  <p className="mt-1 text-base font-medium" style={{ color: "var(--ink-soft)" }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* Why Choose */}
      <Reveal>
        <section className="mx-auto max-w-5xl px-5 py-16 sm:px-6 relative">
          <div className="bb-orb" style={{ background: "#8b5cf6", width: 250, height: 250, right: "10%", bottom: "0%", opacity: 0.15, animationDelay: "5s" }} />
          <SectionHeading eyebrow="Why BrandBridge" title="Built so brands actually want to collaborate" />
          <div className="mt-12 grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2 relative z-10">
            {whyChoose.map((w) => (
              <div key={w.title} className="flex gap-4 border-b border-[var(--border)] pb-6">
                <w.icon size={20} className="mt-1 shrink-0 text-purple-400" />
                <div>
                  <h3 className="bb-display text-base font-medium">{w.title}</h3>
                  <p className="mt-1 text-sm" style={{ color: "var(--ink-soft)" }}>{w.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* Testimonials */}
      <Reveal>
        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-6">
          <SectionHeading eyebrow="Early users" title="Brands collaborating, not competing" />
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="bb-glass bb-card rounded-2xl p-6">
                <div className="mb-3 flex gap-1 text-purple-400">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>
                <p className="text-sm" style={{ color: "var(--ink-soft)" }}>"{t.quote}"</p>
                <div className="mt-4 text-sm font-medium">{t.name}</div>
                <div className="text-xs" style={{ color: "var(--ink-faint)" }}>{t.role}</div>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* Call to Action Final Step */}
      <Reveal>
        <section className="mx-auto max-w-5xl px-5 py-10 sm:px-6 relative">
          <div className="bb-glass-intense relative overflow-hidden rounded-3xl px-8 py-14 text-center">
            <div className="bb-orb" style={{ background: "#8b5cf6", width: 400, height: 400, left: "20%", top: "-50%", opacity: 0.4 }} />
            <h2 className="bb-display relative z-10 text-2xl font-semibold sm:text-3xl">Ready to build smarter campaigns?</h2>
            <p className="relative z-10 mx-auto mt-3 max-w-md text-sm" style={{ color: "var(--ink-soft)" }}>
              Register your brand and let AI find your first collaboration match.
            </p>
            <a href="/signup" className="bb-btn-orange relative z-10 mt-7 inline-flex items-center gap-2 rounded-xl px-7 py-3 text-sm font-medium text-white no-underline">
              Get Started <ArrowRight size={16} />
            </a>
          </div>
        </section>
      </Reveal>

      {/* Footer */}
      <footer className="mx-auto max-w-6xl px-5 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-8 border-t border-[var(--border)] pt-12 sm:grid-cols-4">
          <div className="col-span-2">
            <div className="bb-display bb-grad-text text-lg font-semibold">BrandBridge AI</div>
            <p className="mt-2 max-w-xs text-sm" style={{ color: "var(--ink-soft)" }}>Connecting brands. Empowering creators. Building smarter campaigns.</p>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide bb-mono" style={{ color: "var(--ink-faint)" }}>Company</div>
            <div className="mt-3 flex flex-col gap-2 text-sm" style={{ color: "var(--ink-soft)" }}>
              <a href="#" className="hover:text-[var(--ink)] transition">About</a>
              <a href="#" className="hover:text-[var(--ink)] transition">Contact</a>
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide bb-mono" style={{ color: "var(--ink-faint)" }}>Legal</div>
            <div className="mt-3 flex flex-col gap-2 text-sm" style={{ color: "var(--ink-soft)" }}>
              <a href="#" className="hover:text-[var(--ink)] transition">Privacy Policy</a>
              <a href="#" className="hover:text-[var(--ink)] transition">Terms</a>
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-[var(--border)] pt-6 text-xs" style={{ color: "var(--ink-faint)" }}>
          <span>© 2026 BrandBridge AI. All rights reserved.</span>
          <div className="flex gap-4">
            <Linkedin size={16} />
            <Instagram size={16} />
            <Github size={16} />
          </div>
        </div>
      </footer>
    </div>
  );
}