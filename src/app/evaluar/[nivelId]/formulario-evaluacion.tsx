"use client";

import type { ReactNode } from "react";

export function FormularioEvaluacion({
  action,
  children,
}: {
  action: (formData: FormData) => void | Promise<void>;
  children: ReactNode;
}) {
  return (
    <form
      action={action}
      className="flex flex-col gap-5"
      onInvalidCapture={(event) => {
        const control = event.target as HTMLElement;
        const grupo = control.closest("details");
        if (grupo instanceof HTMLDetailsElement) grupo.open = true;
      }}
    >
      {children}
    </form>
  );
}
