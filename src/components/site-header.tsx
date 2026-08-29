import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { ThemeToggle } from "@/components/theme-toggle";

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/85 backdrop-blur-md">
      <div className="h-[3px] w-full bg-gradient-to-r from-ua via-ua-soft to-ua" />
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="flex h-8 w-9 items-center justify-center rounded-lg bg-ua font-serif text-xs tracking-wide font-semibold text-white shadow-[0_2px_8px_-2px_rgba(138,21,21,0.5)] transition-transform group-hover:scale-105">
            UA
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-serif text-[0.95rem] font-semibold tracking-tight text-foreground">
              CCAA
            </span>
            <span className="text-[0.68rem] text-muted-2">Instrumento de competencias · EPG</span>
          </span>
        </Link>

        <div className="flex items-center gap-5">
          {session?.user && (
            <nav className="flex items-center gap-5 text-sm">
              <Link
                href="/niveles"
                className="text-muted transition-colors hover:text-foreground"
              >
                Mis niveles
              </Link>
              <span className="hidden text-muted-2 sm:inline">{session.user.name}</span>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/login" });
                }}
              >
                <button className="text-muted transition-colors hover:text-ua">Salir</button>
              </form>
            </nav>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
