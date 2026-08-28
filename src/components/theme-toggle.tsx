"use client";

function toggle() {
  const next = !document.documentElement.classList.contains("dark");
  document.documentElement.classList.toggle("dark", next);
  try {
    localStorage.setItem("ccaa-theme", next ? "dark" : "light");
  } catch {}
}

// Sin estado de React: el ícono correcto se decide en CSS según la clase
// "dark" del <html> (ver globals.css), así se evita cualquier desajuste
// entre el render del servidor y el del cliente.
export function ThemeToggle() {
  return (
    <button
      onClick={toggle}
      aria-label="Cambiar tema"
      className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-border-strong hover:text-foreground"
    >
      <svg
        className="dark:hidden"
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
      <svg className="hidden dark:block" width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.5 14.5c-4.5 1.5-9-3-7.5-7.5C9.5 8 7 11 7.5 14.5c.6 4 4.3 6.8 8.3 6.2 2-.3 3.7-1.4 4.7-3z" />
      </svg>
    </button>
  );
}
