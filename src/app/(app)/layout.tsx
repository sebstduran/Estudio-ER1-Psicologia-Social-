import type { ReactNode } from "react";
import { Cascara } from "@/components/cascara";

/**
 * Marco de las pantallas del coordinador: barra lateral con sus niveles y la
 * navegación del instrumento.
 *
 * Vive en un grupo de rutas y no en el layout raíz para que la portada, el
 * ingreso y el formulario del docente queden fuera. La portada es una portada:
 * no lleva barra lateral porque ahí todavía no hay a dónde navegar. Y la
 * pantalla del docente tampoco, ni siquiera cuando la abre el coordinador
 * desde «Ver lo que verán» — si la vista previa mostrara una barra que el
 * docente nunca verá, dejaría de ser una vista previa.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return <Cascara>{children}</Cascara>;
}
