// Unit tests for the pure (DOM-free) helpers in Pedidos/Web/pedidos.js.
//
// Run from the repo root:
//   node --test tests/pedidos.test.js
//
// How it works: pedidos.js is a classic script that boots the whole app at
// load time, so it cannot be require()d directly. Instead this file extracts
// the verbatim source of the pure functions under test (located by markers)
// and evaluates only those, with minimal stubs for the two globals the name
// helpers read (SRCS / S). The code being tested is the shipped code, not a
// copy. Functions that touch the DOM, localStorage or fetch are out of scope
// here and are not extracted.
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const SRC = fs.readFileSync(path.join(__dirname, "..", "Pedidos", "Web", "pedidos.js"), "utf8");

function grab(startMarker, endMarker, includeEnd) {
  const a = SRC.indexOf(startMarker);
  if (a < 0) throw new Error("marker not found: " + startMarker);
  const b = SRC.indexOf(endMarker, a);
  if (b < 0) throw new Error("end marker not found: " + endMarker);
  return SRC.slice(a, includeEnd ? b + endMarker.length : b);
}

const code = [
  // colour helpers (COLORS + hsl2hex/freeColor/pickColor/ensureColors)
  grab("const COLORS=", ";", true),
  grab("function hsl2hex", "const KEY=", false),
  // string helpers
  grab("const norm=", "\n", false),
  grab("const esc=", "\n", false),
  grab("const fmt=", "\n", false),
  // quantity / amount helpers (unitOf, UES, unitTr, unitSums, totTxt, sumO, amtC, amtO, cnt)
  grab("const unitOf=", "const isTyping=", false),
  // name helpers: tcName, vocAll, vocabFind, fixName, lev (needs SRCS/S/srcData stubs below)
  "let S={vocab:[]};",
  "let SRCS={list:[]};",
  "function srcData(){return null}",
  grab("function tcName", "function fuzzy", false),
  // search key + scoring (matchScore also uses lev, defined above)
  grab("const skey=", "\n", false),
  grab("function matchScore", "function candidates", false),
  // data-source config + validation (step 2)
  grab("const SOURCES_VERSION", 'CIG_DEF=SOURCES_REMOTE_BASE+"cigarrillos.json";', true),
  grab("function srcValid", "async function srcFetch", false),
  // image URL helper
  grab("function hiRes", "function picUrl", false),
].join("\n") + "\n;global.__api={COLORS,hsl2hex,freeColor,pickColor,ensureColors,norm,esc,fmt," +
  "unitSums,totTxt,sumO,amtC,amtO,cnt,tcName,fixName,lev,skey,matchScore," +
  "SOURCES_VERSION,SOURCES_REMOTE_BASE,SOURCES_LOCAL_BASE,SRC_DEF,CIG_DEF,srcValid,srcCount,hiRes," +
  "setVocab(v){S.vocab=v}};";

eval(code);
const A = global.__api;

test("norm strips accents, case and surrounding space", () => {
  assert.equal(A.norm("  Café con Leche "), "cafe con leche");
  assert.equal(A.norm("Niño"), "nino");
  assert.equal(A.norm(""), "");
});

test("skey normalises '&' to 'y' and collapses spaces", () => {
  assert.equal(A.skey("Pan & Vino"), "pan y vino");
  assert.equal(A.skey("A  &   B"), "a y b");
  assert.equal(A.skey("  Café "), "cafe");
});

test("esc escapes HTML metacharacters", () => {
  assert.equal(A.esc('<a & "b">'), "&lt;a &amp; &quot;b&quot;&gt;");
  assert.equal(A.esc("plain"), "plain");
});

test("fmt rounds to 2 decimals", () => {
  assert.equal(A.fmt(2), "2");
  assert.equal(A.fmt(2.5), "2.5");
  assert.equal(A.fmt(0.125), "0.13");
});

test("hsl2hex converts primary colours", () => {
  assert.equal(A.hsl2hex(0, 100, 50), "#ff0000");
  assert.equal(A.hsl2hex(240, 100, 50), "#0000ff");
  assert.equal(A.hsl2hex(0, 0, 100), "#ffffff");
  assert.equal(A.hsl2hex(0, 0, 0), "#000000");
});

test("freeColor / ensureColors keep category colours unique", () => {
  assert.equal(A.freeColor(new Set()), A.COLORS[0]);
  const extra = A.freeColor(new Set(A.COLORS));
  assert.ok(!new Set(A.COLORS).has(extra) || extra === A.COLORS[0]);
  const o = { cats: [{ color: "#e8788a" }, { color: "#e8788a" }, {}] };
  assert.equal(A.ensureColors(o), true);
  assert.equal(o.cats[0].color, "#e8788a");
  assert.equal(new Set(o.cats.map((c) => c.color)).size, 3);
  const ok = { cats: [{ color: "#111111" }, { color: "#222222" }] };
  assert.equal(A.ensureColors(ok), false);
});

test("tcName title-cases all-caps names, keeping small words lowercase", () => {
  assert.equal(A.tcName("CAFE CON LECHE"), "Cafe con Leche");
  assert.equal(A.tcName("hola"), "Hola");
  assert.equal(A.tcName(""), "");
  assert.equal(A.tcName("ya Bien"), "Ya Bien");
});

test("fixName resolves to the canonical vocab spelling, else title-cases", () => {
  A.setVocab(["Café con Leche"]);
  assert.equal(A.fixName("CAFE CON LECHE"), "Café con Leche");
  assert.equal(A.fixName("nuevo producto"), "Nuevo producto");
  assert.equal(A.fixName(""), "");
  A.setVocab([]);
});

test("lev computes edit distance (with the >2 length-difference shortcut)", () => {
  assert.equal(A.lev("abc", "abc"), 0);
  assert.equal(A.lev("abc", "abd"), 1);
  assert.equal(A.lev("kitten", "sitting"), 3);
  assert.equal(A.lev("ab", "abcd"), 2);
});

test("matchScore ranks exact > prefix > word-prefix > substring > none", () => {
  assert.equal(A.matchScore("Angel", "angel"), 100);
  assert.equal(A.matchScore("Angel", "ang"), 85);
  assert.equal(A.matchScore("Bebé Angel", "angel"), 75);
  assert.equal(A.matchScore("Angel", "xyz"), 0);
});

test("quantity and amount totals", () => {
  const o = { unit: "件", cats: [
    { items: [{ q: 2, p: 100 }, { q: 3, u: "箱", p: 10 }] },
    { items: [{ q: 0, p: 999 }, { q: 1 }] },
  ] };
  assert.equal(A.sumO(o), 6);
  assert.equal(A.cnt(o), 4);
  assert.equal(A.amtC(o.cats[0]), 230);
  assert.equal(A.amtO(o), 230);
  assert.deepEqual([...A.unitSums(o, o.cats.flatMap((c) => c.items))], [["件", 3], ["箱", 3]]);
  assert.equal(A.totTxt(o, "zh"), "3 件 + 3 箱");
  assert.equal(A.totTxt(o, "es"), "3 un + 3 cj");
  assert.equal(A.totTxt({ unit: "", cats: [] }, "zh"), "0");
});

test("data sources are pinned, not tracking the main branch", () => {
  assert.equal(A.SOURCES_VERSION, "7a5e23c");
  assert.equal(A.SRC_DEF, "https://raw.githubusercontent.com/leohenshuai/pedidos-ios/7a5e23c/sources/saphirus.json");
  assert.equal(A.CIG_DEF, "https://raw.githubusercontent.com/leohenshuai/pedidos-ios/7a5e23c/sources/cigarrillos.json");
  assert.ok(!A.SRC_DEF.includes("/main/"));
  assert.equal(A.SOURCES_LOCAL_BASE, "sources/");
});

test("srcValid / srcCount validate catalogue shape", () => {
  const good = { cats: { A: [["X", 100, 0], ["Y", 200, 1]], B: [] } };
  assert.equal(A.srcValid(good), true);
  assert.equal(A.srcCount(good), 2);
  assert.equal(A.srcValid(null), false);
  assert.equal(A.srcValid({}), false);
  assert.equal(A.srcValid({ cats: { A: [[123]] } }), false);
  assert.equal(A.srcCount(null), 0);
});

test("hiRes upgrades 430px thumbnails to 800px only", () => {
  assert.equal(A.hiRes("img-430x430.jpg"), "img-800x800.jpg");
  assert.equal(A.hiRes("img.png"), "img.png");
});
