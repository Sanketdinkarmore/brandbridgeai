"use client";

import { useRef, KeyboardEvent, ClipboardEvent } from "react";

interface OTPInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
}

export default function OTPInput({ value, onChange, error }: OTPInputProps) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, digit: string) => {
    if (!/^\d?$/.test(digit)) return;

    const next = [...value];
    next[index] = digit;
    onChange(next);

    if (digit && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const next = [...value];
    for (let i = 0; i < 6; i++) {
      next[i] = pasted[i] || "";
    }
    onChange(next);

    const focusIndex = Math.min(pasted.length, 5);
    inputs.current[focusIndex]?.focus();
  };

  return (
    <div>
      <div className="flex justify-center gap-2 sm:gap-3">
        {value.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              inputs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            className={`bb-input h-12 w-10 text-center text-lg font-semibold sm:h-14 sm:w-12 ${error ? "bb-input-error" : ""}`}
          />
        ))}
      </div>
      {error && (
        <p className="mt-2 text-center text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}
