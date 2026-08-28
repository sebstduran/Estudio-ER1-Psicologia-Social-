"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registrarCoordinador } from "@/lib/actions/auth";
import { Button, Card, Field, inputClass } from "@/components/ui";

export default function RegistroPage() {
  const [state, formAction, pending] = useActionState(registrarCoordinador, undefined);

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 px-6 py-16">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Crear cuenta</h1>
        <p className="mt-1 text-sm text-muted">
          Cada coordinador de CCAA administra sus propios niveles y datos.
        </p>
      </div>

      <Card>
        <form action={formAction} className="flex flex-col gap-4">
          <Field label="Nombre completo">
            <input className={inputClass} name="nombre" required autoComplete="name" />
          </Field>
          <Field label="Correo institucional">
            <input
              className={inputClass}
              type="email"
              name="email"
              required
              autoComplete="email"
            />
          </Field>
          <Field label="Contraseña" hint="Mínimo 8 caracteres.">
            <input
              className={inputClass}
              type="password"
              name="password"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </Field>

          {state?.error && (
            <p className="text-sm text-incipiente">{state.error}</p>
          )}

          <Button type="submit" disabled={pending} className="mt-2">
            {pending ? "Creando cuenta…" : "Crear cuenta"}
          </Button>
        </form>
      </Card>

      <p className="text-center text-sm text-muted">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-ua hover:underline">
          Ingresar
        </Link>
      </p>
    </div>
  );
}
