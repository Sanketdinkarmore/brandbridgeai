"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div>
        <label className="mb-1.5 block text-xs font-medium text-white/70">
          {label}
        </label>
        <input
          ref={ref}
          className={`bb-input ${error ? "bb-input-error" : ""} ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-red-400">{error}</p>
        )}
      </div>
    );
  },
);

FormInput.displayName = "FormInput";

export default FormInput;
