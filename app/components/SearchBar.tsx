"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const [value, setValue] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const symbol = value.trim().toUpperCase();
    if (symbol) {
      router.push(`/dashboard/${symbol}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        margin: "16px 20px 0",
        display: "flex",
        alignItems: "center",
        background: "var(--ink-50)",
        borderRadius: "var(--r-pill)",
        padding: "12px 18px",
        gap: "10px",
      }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ color: "var(--ink-500)", flexShrink: 0 }}
      >
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
      <input
        type="text"
        placeholder="Rechercher une action (ex: AAPL)"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={{
          flex: 1,
          fontSize: "14px",
          color: "var(--ink-900)",
        }}
      />
    </form>
  );
}
