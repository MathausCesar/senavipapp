import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-lg font-semibold text-gray-700 mb-3">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-3 text-lg border-2 rounded-lg focus:outline-none focus:border-blue-500 transition-colors bg-white text-gray-900 placeholder:text-gray-700 ${
          error ? "border-red-500" : "border-gray-300"
        } disabled:bg-gray-100 disabled:text-gray-500 ${className}`}
        {...props}
      />
      {error && <p className="text-red-600 text-base mt-2">{error}</p>}
    </div>
  );
}
