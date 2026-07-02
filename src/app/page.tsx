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
} from "lucide-react";

const Linkedin = ({ size = 24 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const Instagram = ({ size = 24 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const Github = ({ size = 24 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

// ---------- Types ----------
interface Feature {
  icon: React.ElementType;
  title: string;
  desc: string;
  soon?: boolean;
}

interface Step {
  n: string;
  title: string;
  desc: string;
}

interface WhyItem {
  icon: React.ElementType;
  title: string;
  desc: string;
}

interface Testimonial {
  name: string;
  role: string;
  quote: string;
}

// ---------- Custom Hooks ----------
function useInView(
  threshold = 0.15,
): [React.RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold },
    );

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
interface RevealProps {
  children: ReactNode;
}

function Reveal({ children }: RevealProps) {
  const [ref, inView] = useInView(0.15);
  return (
    <div ref={ref} className={`reveal ${inView ? "reveal-visible" : ""}`}>
      {children}
    </div>
  );
}

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
}

function SectionHeading({ eyebrow, title, subtitle }: SectionHeadingProps) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <div
        className="bb-display mb-3 text-xs uppercase text-purple-300/70"
        style={{ letterSpacing: "0.2em" }}
      >
        {eyebrow}
      </div>
      <h2 className="bb-display text-2xl font-semibold sm:text-3xl">{title}</h2>
      {subtitle && <p className="mt-3 text-sm text-white/55">{subtitle}</p>}
    </div>
  );
}

interface BrandCardProps {
  name: string;
  tag: string;
}

function BrandCard({ name, tag }: BrandCardProps) {
  return (
    <div
      className="bb-glass bb-card w-full rounded-2xl p-4 text-left sm:w-44"
      style={{ maxWidth: "200px" }}
    >
      <div
        className="mb-3 h-8 w-8 rounded-lg"
        style={{ background: "linear-gradient(135deg,#8b5cf6,#4f8cff)" }}
      />
      <div className="bb-display text-sm font-medium">{name}</div>
      <div className="text-xs text-white/50">{tag}</div>
    </div>
  );
}

function BridgeMatch() {
  const [ref, inView] = useInView(0.3);
  const score = useCountUp(94, inView);

  return (
    <div
      ref={ref}
      className={`reveal ${inView ? "reveal-visible" : ""} relative mx-auto mt-16 max-w-3xl`}
    >
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
        <BrandCard name="Solace Audio" tag="Audio Tech" />
        <div className="relative flex h-16 w-full items-center justify-center sm:h-24 sm:w-40">
          <svg
            className="absolute h-full w-full"
            viewBox="0 0 160 60"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="bbGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#4f8cff" />
              </linearGradient>
            </defs>
            <path
              d="M0,30 C40,0 120,60 160,30"
              stroke="url(#bbGrad)"
              strokeWidth="2"
              fill="none"
              className="bb-path"
            />
          </svg>
          <div className="bb-glass-strong bb-pulse-ring relative z-10 rounded-2xl px-4 py-2 text-center">
            <div className="bb-display bb-grad-text text-xl font-semibold">
              {score}%
            </div>
            <div
              className="text-xs uppercase tracking-wide text-white/50"
              style={{ fontSize: "10px" }}
            >
              AI Match
            </div>
          </div>
        </div>
        <BrandCard name="Verve Fitness" tag="Sportswear" />
      </div>
    </div>
  );
}

// ---------- Data ----------
const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

const features: Feature[] = [
  {
    icon: Sparkles,
    title: "AI Brand Matching",
    desc: "Get paired with brands whose audience and values actually line up with yours.",
  },
  {
    icon: Users,
    title: "Brand Collaboration",
    desc: "Run joint campaigns with another brand instead of competing for the same budget.",
  },
  {
    icon: Rocket,
    title: "Product Promotion",
    desc: "Get an established brand to promote your product to an audience you don't have yet.",
  },
  {
    icon: Palette,
    title: "Freelancer Marketplace",
    desc: "Hire vetted designers, editors, and writers once a collaboration is ready to go.",
  },
  {
    icon: FileText,
    title: "AI Proposal Generator",
    desc: "Skip the blank page — AI drafts the collaboration proposal and outreach email.",
  },
  {
    icon: BarChart3,
    title: "Campaign Management",
    desc: "Track every active collaboration and campaign from one dashboard.",
  },
  {
    icon: LineChart,
    title: "Analytics Dashboard",
    desc: "Deeper performance and ROI reporting, on the way.",
    soon: true,
  },
];

const steps: Step[] = [
  {
    n: "01",
    title: "Register",
    desc: "Pick your role — brand, product owner, or freelancer.",
  },
  {
    n: "02",
    title: "AI Finds Best Match",
    desc: "Gemini scores compatibility across audience, industry, and goals.",
  },
  {
    n: "03",
    title: "Send Collaboration Request",
    desc: "Review the AI's pick and send a request in one click.",
  },
  {
    n: "04",
    title: "Brand Accepts",
    desc: "The other brand reviews the AI-drafted proposal and accepts.",
  },
  {
    n: "05",
    title: "Hire Freelancer",
    desc: "Bring in a freelancer from the marketplace to build the creative.",
  },
  {
    n: "06",
    title: "Campaign Launch",
    desc: "Everyone's aligned, and the campaign goes live.",
  },
];

const whyChoose: WhyItem[] = [
  {
    icon: Wallet,
    title: "Lower Marketing Cost",
    desc: "Split reach and budget instead of paying for an audience from scratch.",
  },
  {
    icon: Brain,
    title: "AI-Powered Matching",
    desc: "Compatibility scoring removes the guesswork from outreach.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Brands",
    desc: "Every brand profile is reviewed before it appears in matches.",
  },
  {
    icon: CheckCircle2,
    title: "Verified Freelancers",
    desc: "Portfolios and experience are checked before freelancers go live.",
  },
  {
    icon: Zap,
    title: "Fast Collaboration",
    desc: "Go from match to signed proposal in days, not weeks.",
  },
  {
    icon: Lock,
    title: "Secure Platform",
    desc: "Conversations and files stay private between collaborators.",
  },
];

const testimonials: Testimonial[] = [
  {
    name: "Aarav Mehta",
    role: "Co-founder, Solace Audio",
    quote:
      "We found a fitness brand to co-launch with in under a week. The AI's proposal draft needed maybe two edits.",
  },
  {
    name: "Priya Nair",
    role: "Marketing Lead, Petal Skincare",
    quote:
      "Hiring a freelancer straight out of a matched collaboration meant we never briefed from zero.",
  },
  {
    name: "Karan Shah",
    role: "Founder, Northwind Foods",
    quote:
      "The compatibility score actually matched our gut instinct, which is rare for a recommendation engine.",
  },
];

// ---------- Main Component ----------
export default function BrandBridgeLanding() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="bb-page min-h-screen">
      {/* Navbar */}
      <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6">
        <nav className="bb-glass mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-5 py-3">
          <div className="bb-display flex items-center gap-2 text-lg font-semibold">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-xl"
              style={{ background: "linear-gradient(135deg,#8b5cf6,#4f8cff)" }}
            >
              <Sparkles size={16} className="text-white" />
            </span>
            <span className="bb-grad-text">BrandBridge</span>
            <span className="text-sm font-normal text-white/40">AI</span>
          </div>

          <div className="hidden items-center gap-7 text-sm text-white/70 md:flex">
            {navLinks.map((l) => (
              <a key={l.label} href={l.href} className="transition hover:text-white">
                {l.label}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <a href="/login" className="text-sm text-white/70 hover:text-white">
              Login
            </a>
            <a
              href="/signup"
              className="bb-btn-primary rounded-xl px-4 py-2 text-sm font-medium"
            >
              Sign Up
            </a>
          </div>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="text-white/80 md:hidden"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>

        {menuOpen && (
          <div className="bb-glass mx-2 mt-2 flex flex-col gap-3 rounded-2xl p-5 text-sm text-white/80 md:hidden">
            {navLinks.map((l) => (
              <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)}>
                {l.label}
              </a>
            ))}
            <div className="mt-2 flex gap-3 border-t border-white/10 pt-3">
              <a href="/login" className="flex-1 text-center">
                Login
              </a>
              <a
                href="/signup"
                className="bb-btn-primary flex-1 rounded-xl py-2 text-center font-medium"
              >
                Sign Up
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-5 pt-16 pb-20 sm:px-6 sm:pt-24">
        <div
          className="bb-orb -left-16 -top-10 h-72 w-72"
          style={{ background: "#8b5cf6" }}
        />
        <div
          className="bb-orb right-0 top-40 h-64 w-64"
          style={{ background: "#4f8cff", animationDelay: "2s" }}
        />

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <div className="bb-glass mx-auto mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs text-white/70">
            <Sparkles size={14} className="text-purple-300" />
            Built for brands who'd rather collaborate than compete
          </div>
          <h1 className="bb-display text-4xl font-semibold leading-tight sm:text-5xl md:text-6xl">
            Connect Brands.
            <br />
            Discover Opportunities.
            <br />
            <span className="bb-grad-text">Launch Better Campaigns.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base text-white/60 sm:text-lg">
            An AI-powered collaboration marketplace that connects brands,
            product owners, and freelancers to build marketing campaigns
            together.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="/signup"
              className="bb-btn-primary flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium"
            >
              Get Started <ArrowRight size={16} />
            </a>
            <a
              href="#features"
              className="bb-glass rounded-xl px-6 py-3 text-sm font-medium text-white/80 hover:text-white"
            >
              Explore Platform
            </a>
          </div>
        </div>

        <BridgeMatch />
      </section>

      {/* Features */}
      <Reveal>
        <section id="features" className="mx-auto max-w-6xl px-5 py-16 sm:px-6">
          <SectionHeading
            eyebrow="Platform"
            title="Everything a collaboration needs"
          />
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="bb-glass bb-card relative rounded-2xl p-6"
              >
                {f.soon && (
                  <span
                    className="absolute right-4 top-4 rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/60"
                    style={{ fontSize: "10px" }}
                  >
                    Coming soon
                  </span>
                )}
                <div
                  className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: "rgba(139,92,246,0.18)" }}
                >
                  <f.icon size={18} className="text-purple-200" />
                </div>
                <h3 className="bb-display text-base font-medium">{f.title}</h3>
                <p className="mt-2 text-sm text-white/55">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* How it works */}
      <Reveal>
        <section
          id="how-it-works"
          className="mx-auto max-w-3xl px-5 py-16 sm:px-6"
        >
          <SectionHeading
            eyebrow="Process"
            title="From sign-up to launch in six steps"
          />
          <div className="relative mt-14 space-y-8 border-l border-white/10 pl-8">
            {steps.map((s, i) => (
              <div key={s.n} className="relative">
                <div
                  className="bb-display absolute flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold"
                  style={{
                    background: "linear-gradient(135deg,#8b5cf6,#4f8cff)",
                    left: "-42px",
                  }}
                >
                  {i + 1}
                </div>
                <div className="text-xs text-white/40">{s.n}</div>
                <h3 className="bb-display mt-1 text-lg font-medium">
                  {s.title}
                </h3>
                <p className="mt-1 text-sm text-white/55">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* Why choose */}
      <Reveal>
        <section className="mx-auto max-w-5xl px-5 py-16 sm:px-6">
          <SectionHeading
            eyebrow="Why BrandBridge"
            title="Built so brands actually want to collaborate"
          />
          <div className="mt-12 grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2">
            {whyChoose.map((w) => (
              <div
                key={w.title}
                className="flex gap-4 border-b border-white/10 pb-6"
              >
                <w.icon size={20} className="mt-1 shrink-0 text-purple-300" />
                <div>
                  <h3 className="bb-display text-base font-medium">
                    {w.title}
                  </h3>
                  <p className="mt-1 text-sm text-white/55">{w.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* Testimonials */}
      <Reveal>
        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-6">
          <SectionHeading
            eyebrow="Early users"
            title="Brands collaborating, not competing"
          />
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="bb-glass bb-card rounded-2xl p-6">
                <div className="mb-3 flex gap-1 text-purple-300">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" />
                  ))}
                </div>
                <p className="text-sm text-white/70">"{t.quote}"</p>
                <div className="mt-4 text-sm font-medium">{t.name}</div>
                <div className="text-xs text-white/45">{t.role}</div>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* CTA */}
      <Reveal>
        <section className="mx-auto max-w-5xl px-5 py-10 sm:px-6">
          <div className="bb-glass-strong relative overflow-hidden rounded-3xl px-8 py-14 text-center">
            <div
              className="bb-orb left-1/3 top-0 h-56 w-56"
              style={{ background: "#8b5cf6" }}
            />
            <h2 className="bb-display relative z-10 text-2xl font-semibold sm:text-3xl">
              Ready to build smarter campaigns?
            </h2>
            <p className="relative z-10 mx-auto mt-3 max-w-md text-sm text-white/60">
              Register your brand and let AI find your first collaboration
              match.
            </p>
            <a
              href="/signup"
              className="bb-btn-primary relative z-10 mt-7 inline-flex items-center gap-2 rounded-xl px-7 py-3 text-sm font-medium"
            >
              Get Started <ArrowRight size={16} />
            </a>
          </div>
        </section>
      </Reveal>

      {/* Footer */}
      <footer className="mx-auto max-w-6xl px-5 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-12 sm:grid-cols-4">
          <div className="col-span-2">
            <div className="bb-display bb-grad-text text-lg font-semibold">
              BrandBridge AI
            </div>
            <p className="mt-2 max-w-xs text-sm text-white/50">
              Connecting brands. Empowering creators. Building smarter
              campaigns.
            </p>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-white/40">
              Company
            </div>
            <div className="mt-3 flex flex-col gap-2 text-sm text-white/60">
              <a href="#">About</a>
              <a href="#">Contact</a>
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-white/40">
              Legal
            </div>
            <div className="mt-3 flex flex-col gap-2 text-sm text-white/60">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms</a>
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row">
          <span>©️ 2026 BrandBridge AI. All rights reserved.</span>
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