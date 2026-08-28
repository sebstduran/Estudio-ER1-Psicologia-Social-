"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("ccaa-theme", next ? "dark" : "light");
    } catch {}
  }

  return (
    <button
      onClick={toggle}
      aria-label="Cambiar tema"
      className="rounded-md border border-border px-2.5 py-1.5 text-xs text-muted hover:text-foreground hover:border-ua transition-colors"
    >
      {dark ? "Modo claro" : "Modo oscuro"}
    </button>
  );
}
