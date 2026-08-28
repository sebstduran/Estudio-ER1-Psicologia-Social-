import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

// Server-side guard para rutas de coordinador. Al ejecutar Prisma/bcrypt en
// el authorize() de Credentials, la validación de sesión debe correr en
// runtime Node (páginas de servidor), no en el Proxy/Edge — por eso el
// control de acceso se hace aquí y no en proxy.ts.
export async function requireCoordinador() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session.user;
}
