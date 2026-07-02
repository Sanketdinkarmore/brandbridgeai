"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Users, Brain } from "lucide-react";

interface AuthShellProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export default function AuthShell({ children, title, subtitle }: AuthShellProps) {
  return (
    <div className="bb-page relative flex min-h-screen">
      <div
        className="bb-orb -left-16 top-20 h-72 w-72"
        style={{ background: "#8b5cf6" }}
      />
      <div
        className="bb-orb right-0 bottom-20 h-64 w-64"
        style={{ background: "#4f8cff", animationDelay: "2s" }}
      />

      {/* Left panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden p-12 lg:flex">
        <Link href="/" className="bb-display flex items-center gap-2 text-lg font-semibold">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-xl"
            style={{ background: "linear-gradient(135deg,#8b5cf6,#4f8cff)" }}
          >
            <Sparkles size={16} className="text-white" />
          </span>
          <span className="bb-grad-text">BrandBridge</span>
          <span className="text-sm font-normal text-white/40">AI</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="bb-display text-3xl font-semibold leading-tight xl:text-4xl">
            Connecting brands.
            <br />
            <span className="bb-grad-text">Empowering creators.</span>
          </h1>
          <p className="mt-4 max-w-md text-sm text-white/55">
            AI-powered collaboration marketplace for smarter marketing campaigns.
          </p>

          <div className="mt-10 space-y-4">
            {[
              { icon: Brain, text: "AI brand compatibility matching" },
              { icon: Users, text: "Collaborate with verified brands" },
              { icon: Sparkles, text: "Auto-generated proposals & emails" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-white/70">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ background: "rgba(139,92,246,0.18)" }}
                >
                  <Icon size={16} className="text-purple-300" />
                </div>
                {text}
              </div>
            ))}
          </div>

          <div className="bb-glass bb-card mt-12 max-w-sm rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-white/45">AI Match Score</div>
                <div className="bb-display bb-grad-text text-2xl font-semibold">94%</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-white/45">Solace Audio × Verve Fitness</div>
                <div className="mt-1 text-xs text-green-400">High compatibility</div>
              </div>
            </div>
          </div>
        </motion.div>

        <p className="text-xs text-white/30">
          © 2026 BrandBridge AI. All rights reserved.
        </p>
      </div>

      {/* Right panel */}
      <div className="relative flex w-full flex-col items-center justify-center px-5 py-10 lg:w-1/2">
        <Link
          href="/"
          className="bb-display mb-8 flex items-center gap-2 text-lg font-semibold lg:hidden"
        >
          <span
            className="flex h-8 w-8 items-center justify-center rounded-xl"
            style={{ background: "linear-gradient(135deg,#8b5cf6,#4f8cff)" }}
          >
            <Sparkles size={16} className="text-white" />
          </span>
          <span className="bb-grad-text">BrandBridge AI</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bb-glass-strong w-full max-w-lg rounded-3xl p-8"
        >
          <div className="mb-6 text-center">
            <h2 className="bb-display text-2xl font-semibold">{title}</h2>
            {subtitle && (
              <p className="mt-2 text-sm text-white/55">{subtitle}</p>
            )}
          </div>
          {children}
        </motion.div>
      </div>
    </div>
  );
}
