"use client";

import { useActionState } from "react";
import Link from "next/link";
import { iniciarSesion } from "@/lib/actions/auth";
import { Button, Card, Field, inputClass } from "@/components/ui";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(iniciarSesion, undefined);

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 px-6 py-16">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Ingresar</h1>
        <p className="mt-1 text-sm text-muted">
          Acceso para coordinadores de CCAA.
        </p>
      </div>

      <Card>
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

          <Button type="submit" disabled={pending} className="mt-2">
            {pending ? "Ingresando…" : "Ingresar"}
          </Button>
        </form>
      </Card>

      <p className="text-center text-sm text-muted">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="text-ua hover:underline">
          Crear cuenta de coordinador
        </Link>
      </p>
    </div>
  );
}
