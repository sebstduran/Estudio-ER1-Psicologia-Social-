"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registrarCoordinador } from "@/lib/actions/auth";
import { Button, Card, Field, inputClass } from "@/components/ui";
import { AuthFrame } from "@/components/auth-frame";

export default function RegistroPage() {
  const [state, formAction, pending] = useActionState(registrarCoordinador, undefined);

  return (
    <AuthFrame eyebrow="Nueva coordinación" title="Crea tu espacio." description="Tus niveles, respuestas y acuerdos quedarán resguardados en una cuenta de coordinación.">
      <Card className="!border-0 !p-0 !shadow-none">
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

      <p className="mt-8 text-sm text-muted">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-medium text-ua hover:underline">
          Ingresar
        </Link>
      </p>
    </AuthFrame>
  );
}
