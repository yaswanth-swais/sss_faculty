"use client";

/**
 * Button — Reusable button component
 *
 * Variants: primary (Electric Blue), outline, danger, ghost
 * Sizes: sm, md, lg
 */

export default function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  onClick,
  type = "button",
  className = "",
  id,
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

  const variants = {
    primary:
      "ai-gradient text-white hover:opacity-90 focus:ring-indigo-400 shadow-sm hover:shadow-lg active:scale-[0.98]",
    outline:
      "border-2 border-indigo-500 text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-400 active:scale-[0.98]",
    danger:
      "bg-danger text-white hover:bg-red-700 focus:ring-danger shadow-sm hover:shadow-md active:scale-[0.98]",
    ghost:
      "text-text hover:bg-gray-100 focus:ring-gray-300 active:scale-[0.98]",
    secondary:
      "bg-secondary text-white hover:opacity-90 focus:ring-secondary shadow-sm hover:shadow-md active:scale-[0.98]",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2.5",
  };

  return (
    <button
      id={id}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
