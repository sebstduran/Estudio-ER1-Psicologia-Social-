"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

const registroSchema = z.object({
  nombre: z.string().trim().min(2, "Ingresa tu nombre."),
  email: z.string().trim().toLowerCase().email("Correo inválido."),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
});

export type FormState = { error?: string } | undefined;

export async function registrarCoordinador(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = registroSchema.safeParse({
    nombre: formData.get("nombre"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const { nombre, email, password } = parsed.data;

  const existente = await prisma.coordinador.findUnique({ where: { email } });
  if (existente) {
    return { error: "Ya existe una cuenta con ese correo." };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.coordinador.create({ data: { nombre, email, passwordHash } });

  await signIn("credentials", { email, password, redirectTo: "/niveles" });
}

export async function iniciarSesion(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/niveles",
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Correo o contraseña incorrectos." };
    }
    throw err;
  }
}

export async function cerrarSesionYRedirigir() {
  redirect("/login");
}
