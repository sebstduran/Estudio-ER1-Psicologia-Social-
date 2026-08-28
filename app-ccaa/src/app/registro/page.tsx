"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registrarCoordinador } from "@/lib/actions/auth";
import { Button, Card, Field, inputClass } from "@/components/ui";

export default function RegistroPage() {
  const [state, formAction, pending] = useActionState(registrarCoordinador, undefined);

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-7 px-6 py-20 sm:py-28">
      <div className="text-center">
        <span className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-ua font-serif text-lg font-semibold text-white">
          E
        </span>
        <h1 className="font-serif text-2xl font-semibold tracking-tight">Crear cuenta</h1>
        <p className="mt-1.5 text-sm text-muted">
          Cada coordinador administra sus propios niveles y datos.
        </p>
      </div>

      <Card className="animate-fade-in">
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

          <Button type="submit" disabled={pending} className="mt-2 w-full">
            {pending ? "Creando cuenta…" : "Crear cuenta"}
          </Button>
        </form>
      </Card>

      <p className="text-center text-sm text-muted">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-medium text-ua hover:underline">
          Ingresar
        </Link>
      </p>
    </div>
  );
}
