import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { ThemeToggle } from "@/components/theme-toggle";

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-lg font-semibold tracking-tight text-ua">CCAA</span>
          <span className="text-sm text-muted">Instrumento de competencias · EPG</span>
        </Link>

        <div className="flex items-center gap-4">
          {session?.user && (
            <nav className="flex items-center gap-4 text-sm text-muted">
              <Link href="/niveles" className="hover:text-foreground transition-colors">
                Mis niveles
              </Link>
              <span className="hidden sm:inline">{session.user.name}</span>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/login" });
                }}
              >
                <button className="hover:text-ua transition-colors">Salir</button>
              </form>
            </nav>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
