"use client";

import { useActionState } from "react";
import Link from "next/link";
import { iniciarSesion } from "@/lib/actions/auth";
import { Button, Card, Field, inputClass } from "@/components/ui";
import { AuthFrame } from "@/components/auth-frame";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(iniciarSesion, undefined);

  return (
    <AuthFrame eyebrow="Acceso de coordinación" title="Continuemos." description="Ingresa para preparar el nivel, reunir la evidencia y conducir la próxima decisión.">
      <Card className="!p-0 !shadow-none !border-0">
        <form action={formAction} className="flex flex-col gap-4">
          <Field label="Correo institucional">
            <input
              className={inputClass}
              type="email"
              name="email"
              required
              autoComplete="email"
            />
          </Field>
          <Field label="Contraseña">
            <input
              className={inputClass}
              type="password"
              name="password"
              required
              autoComplete="current-password"
            />
          </Field>

          {state?.error && (
            <p className="text-sm text-incipiente">{state.error}</p>
          )}

          <Button type="submit" disabled={pending} className="mt-2 w-full">
            {pending ? "Ingresando…" : "Ingresar"}
          </Button>
        </form>
      </Card>

      <p className="mt-8 text-sm text-muted">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="font-medium text-ua hover:underline">
          Crear cuenta de coordinador
        </Link>
      </p>
    </AuthFrame>
  );
}
