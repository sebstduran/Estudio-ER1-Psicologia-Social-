import assert from "node:assert/strict";
import test from "node:test";
import { amplitudDeEvidencia, clasificar, hayDisenso, scoreDe } from "./diagnostico";

test("calcula puntaje y cortes institucionales", () => {
  assert.equal(scoreDe({ LOGRADO: 1, EN_PROCESO: 1, INCIPIENTE: 0, NO_TRABAJADO: 4 }), 75);
  assert.equal(clasificar(39.99), "CRITICO");
  assert.equal(clasificar(40), "EN_RIESGO");
  assert.equal(clasificar(70), "CONSOLIDADO");
});

test("separa disenso de bajo logro", () => {
  assert.equal(hayDisenso({ LOGRADO: 1, EN_PROCESO: 0, INCIPIENTE: 1, NO_TRABAJADO: 0 }), true);
  assert.equal(hayDisenso({ LOGRADO: 0, EN_PROCESO: 0, INCIPIENTE: 3, NO_TRABAJADO: 0 }), false);
});

test("presenta como limitada una sola mirada profesional", () => {
  assert.equal(amplitudDeEvidencia(1, 1), "LIMITADA");
  assert.equal(amplitudDeEvidencia(2, 2), "AMPLIA");
  assert.equal(amplitudDeEvidencia(1, 4), "LIMITADA");
  assert.equal(amplitudDeEvidencia(0, 4), "SIN_EVIDENCIA");
});
