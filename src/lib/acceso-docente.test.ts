import assert from "node:assert/strict";
import test from "node:test";
import { crearAccesoDocente, verificarAccesoDocente } from "./acceso-docente";

test("acepta un enlace docente firmado y conserva su alcance", () => {
  process.env.AUTH_SECRET = "secreto-de-prueba-suficientemente-largo";
  const token = crearAccesoDocente({ nivelId: "nivel-1", docenteId: "docente-1", reunionId: "r-1" });
  assert.deepEqual(verificarAccesoDocente(token), {
    v: 1,
    nivelId: "nivel-1",
    docenteId: "docente-1",
    reunionId: "r-1",
  });
});

test("rechaza un enlace docente alterado", () => {
  process.env.AUTH_SECRET = "secreto-de-prueba-suficientemente-largo";
  const token = crearAccesoDocente({ nivelId: "nivel-1", docenteId: "docente-1", reunionId: "r-1" });
  const alterado = `${token.slice(0, -1)}${token.endsWith("a") ? "b" : "a"}`;
  assert.equal(verificarAccesoDocente(alterado), null);
});
