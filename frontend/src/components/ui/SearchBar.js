"use client";

/**
 * SearchBar — Search/filter input with icon and debounced onChange
 */

import { useState, useEffect, useRef } from "react";

export default function SearchBar({
  placeholder = "Search...",
  value = "",
  onChange,
  debounceMs = 300,
  id,
}) {
  const [localValue, setLocalValue] = useState(value);
  const timerRef = useRef(null);

  // Sync with external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onChange?.(newValue);
    }, debounceMs);
  };

  const handleClear = () => {
    setLocalValue("");
    onChange?.("");
  };

  return (
    <div className="relative" id={id}>
      {/* Search icon */}
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-lighter pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>

      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2.5 bg-white border border-border rounded-lg text-sm text-text placeholder:text-text-lighter focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
      />

      {/* Clear button */}
      {localValue && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded text-text-lighter hover:text-text transition-colors cursor-pointer"
          aria-label="Clear search"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
