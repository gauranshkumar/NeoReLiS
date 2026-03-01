"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import { locales, localeNames, type Locale } from "@/i18n/config";
import { useLocale } from "next-intl";

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function switchLocale(next: Locale) {
    // Set cookie so middleware + server resolve the new locale
    document.cookie = `NEXT_LOCALE=${next};path=/;max-age=31536000;SameSite=Lax`;
    setOpen(false);
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
        aria-label="Change language"
      >
        <Globe className="w-3.5 h-3.5" />
        <span className="uppercase">{locale}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-36 rounded-lg border border-white/10 bg-[#141414] shadow-xl z-50 overflow-hidden">
          {locales.map((l) => (
            <button
              key={l}
              onClick={() => switchLocale(l)}
              className={`w-full text-left px-3 py-2 text-sm transition-colors cursor-pointer ${
                l === locale
                  ? "bg-cyan-500/10 text-cyan-400"
                  : "text-gray-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              {localeNames[l]}
              {l === locale && (
                <span className="ml-2 text-[10px] text-cyan-500">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
