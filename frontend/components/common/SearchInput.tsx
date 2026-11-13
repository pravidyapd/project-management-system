
"use client";

import { Search, X } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
}: SearchInputProps) {
  return (
    <div className="group relative w-full max-w-sm">
      <Search
        size={18}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-orange-400"
      />

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full border border-white/10 bg-[#171717] py-3 pl-11 pr-11 text-sm text-white placeholder:text-zinc-500 outline-none transition-all duration-200 hover:border-white/20 focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/15"
      />

      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors hover:text-orange-400"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
