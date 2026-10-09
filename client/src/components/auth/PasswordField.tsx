"use client";

import { useId, useState } from "react";

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  /** Extra classes on the outer label wrapper */
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  toggleButtonClassName?: string;
  /** Inner wrapper around input + toggle (default: relative mt-2) */
  fieldWrapperClassName?: string;
};

export default function PasswordField({
  label,
  value,
  onChange,
  placeholder = "Password",
  required = false,
  autoComplete = "current-password",
  className = "",
  labelClassName = "block text-sm font-medium text-[#5a3b8a]",
  inputClassName = "box-border h-12 w-full rounded-xl border border-[#d8c9fb] bg-[#fcfaff] px-4 py-0 pl-4 pr-12 text-base leading-normal text-[#342151] outline-none placeholder:text-[#a288cf] transition-all focus:border-[#F47820] focus:ring-2 focus:ring-[#ddd1ff] [&::-ms-reveal]:hidden [&::-webkit-credentials-auto-fill-button]:hidden",
  toggleButtonClassName = "absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[#6e52a0] transition-colors hover:bg-[#f3ecff] hover:text-[#4e2b86]",
  fieldWrapperClassName = "relative mt-2",
}: Props) {
  const id = useId();
  const [visible, setVisible] = useState(false);

  return (
    <div className={className}>
      <label htmlFor={id} className={labelClassName}>
        {label}
      </label>
      <div className={fieldWrapperClassName}>
        <input
          id={id}
          type={visible ? "text" : "password"}
          required={required}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={inputClassName}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible((v) => !v)}
          className={toggleButtonClassName}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeSlashIcon /> : <EyeIcon />}
        </button>
      </div>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="h-5 w-5 flex-shrink-0"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <path
        d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12Z"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Fill the pupil so the icon looks correct */}
      <circle cx="12" cy="12" r="3" fill="currentColor" />
    </svg>
  );
}

function EyeSlashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="h-5 w-5 flex-shrink-0"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <path
        d="M3 3l18 18M10.5 10.677a2 2 0 002.823 2.823M7.362 7.561C5.746 8.834 4.5 10.528 3.88 12c1.89 4.14 6.08 6 8.12 6 1.074 0 2.17-.24 3.202-.7M9.88 9.88a3 3 0 004.24 4.24"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.21 6.21C4.6 7.24 3.25 8.86 2.46 10.71 4.35 14.85 8.54 17.5 12 17.5c1.55 0 3.13-.45 4.66-1.29"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
