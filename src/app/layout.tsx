import type { Metadata } from "next";
import { Geist_Mono, Instrument_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";

// Una sola familia para toda la interfaz y una monoespaciada para cifras,
// códigos y rótulos. Las columnas de números se alinean con tabular-nums.
const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Instrumento CCAA · EPG",
  description: "Diagnóstico de competencias de ciclo y decisiones de Estrategia Pedagógica Global.",
};

// Evita el "flash" de tema incorrecto: decide claro/oscuro antes de pintar.
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem('ccaa-theme');
    var dark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', dark);
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${instrument.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
      </head>
      {/* La barra lateral la monta el grupo (app), sólo en las pantallas del
          coordinador. Aquí abajo cuelgan también la portada, el ingreso y el
          formulario del docente, que se dibujan solos. */}
      <body className="min-h-full bg-background font-sans text-foreground">
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
