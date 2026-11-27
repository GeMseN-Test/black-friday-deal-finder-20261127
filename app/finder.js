// DealHound finder — filtering, sorting and rendering the deal grid.
// All state lives here; tools.js owns the matrix, budget and compare panels.
import { deals, STORES, CHECKED_LABEL } from "./deals.js";

export const VERDICTS = [
  { label: "All-time low", cls: "v0" },
  { label: "Near all-time low", cls: "v1" },
  { label: "Huge deal", cls: "v2" },
  { label: "Strong deal", cls: "v3" },
];

export function money(n) {
  return "$" + n.toFixed(2).replace(/\.00$/, "");
}
export function pctOf(d) {
  return Math.round((1 - d.p / d.w) * 100);
}
export function savedOf(d) {
  return d.w - d.p;
}
export function evidenceOf(d) {
  if (d.v === 0) return "Matches the cheapest price ever recorded for this game — a true record low.";
  if (d.v === 1) return "Within 15% of the cheapest ever ($" + d.ce.toFixed(2) + ") — all but a record.";
  if (d.v === 2) return "A deep " + pctOf(d) + "% cut, but it has sold cheaper — cheapest ever $" + d.ce.toFixed(2) + ".";
  return pctOf(d) + "% off, yet the cheapest ever was $" + d.ce.toFixed(2) + " — good, not great.";
}

export const state = {
  q: "",
  cat: "All",
  store: "All",
  minOff: 0,
  atlOnly: false,
  sort: "saved",
  compare: new Set(),
};

function applyFilters() {
  const q = state.q.trim().toLowerCase();
  let list = deals.filter((d) => {
    if (q && !d.t.toLowerCase().includes(q)) return false;
    if (state.cat !== "All" && d.c !== state.cat) return false;
    if (state.store !== "All" && d.s !== state.store) return false;
    if (pctOf(d) < state.minOff) return false;
    if (state.atlOnly && d.v !== 0) return false;
    return true;
  });
  const by = {
    saved: (a, b) => savedOf(b) - savedOf(a) || pctOf(b) - pctOf(a),
    pct: (a, b) => pctOf(b) - pctOf(a) || savedOf(b) - savedOf(a),
    price: (a, b) => a.p - b.p || pctOf(b) - pctOf(a),
    verdict: (a, b) => a.v - b.v || savedOf(b) - savedOf(a),
  };
  return list.sort(by[state.sort]);
}

function ratingLine(d) {
  const bits = [];
  if (d.m) bits.push("Metacritic <b>" + d.m + "</b>");
  if (d.sr) bits.push("Steam <b>" + d.sr + "% positive</b> (" + d.sc.toLocaleString("en-US") + " reviews)");
  return bits.length ? bits.join(" · ") : "";
}

export function cardHtml(d) {
  const v = VERDICTS[d.v];
  const checked = state.compare.has(d.id) ? " checked" : "";
  return (
    '<article class="card" data-id="' + d.id + '">' +
    '<div class="card-top"><span class="verdict ' + v.cls + '">' + v.label + '</span>' +
    '<span class="store-chip">' + STORES[d.s] + '</span></div>' +
    '<h3><a href="#/deal/' + d.id + '">' + escapeHtml(d.t) + '</a></h3>' +
    '<p class="cat">' + escapeHtml(d.c) + '</p>' +
    '<div class="price-row"><span class="price">' + money(d.p) + '</span>' +
    '<span class="was">' + money(d.w) + '</span>' +
    '<span class="off">-' + pctOf(d) + '%</span></div>' +
    '<p class="saved-line">You save ' + money(savedOf(d)) + ' · cheapest ever ' + money(d.ce) + '</p>' +
    '<p class="evidence">' + evidenceOf(d) + '</p>' +
    (ratingLine(d) ? '<p class="ratings">' + ratingLine(d) + '</p>' : "") +
    '<p class="checked">Checked ' + CHECKED_LABEL + ' · CheapShark' +
    (d.s === "ST" ? " + Steam store" : "") + '</p>' +
    '<div class="card-foot">' +
    '<a class="btn" href="' + d.u + '" target="_blank" rel="noopener">View at ' + STORES[d.s] + '</a>' +
    '<label class="compare-check"><input type="checkbox" data-compare="' + d.id + '"' + checked + '> Compare</label>' +
    '</div></article>'
  );
}

export function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function renderGrid() {
  const grid = document.getElementById("grid");
  const list = applyFilters();
  grid.innerHTML = list.map(cardHtml).join("");
  document.getElementById("empty").hidden = list.length > 0;
  document.getElementById("result-count").textContent = list.length;
  const totalSaved = list.reduce((a, d) => a + savedOf(d), 0);
  document.getElementById("result-saved").textContent =
    "you save " + money(totalSaved) + " in total";
  document.getElementById("grid-title").textContent =
    state.atlOnly ? "All-time lows" : state.q ? 'Results for "' + state.q + '"' : "All deals";
}

export function renderStats() {
  const atl = deals.filter((d) => d.v === 0).length;
  const totalSaved = deals.reduce((a, d) => a + savedOf(d), 0);
  const avg = deals.reduce((a, d) => a + (1 - d.p / d.w), 0) / deals.length * 100;
  document.getElementById("stat-deals").textContent = deals.length;
  document.getElementById("stat-avg").textContent = avg.toFixed(1) + "%";
  document.getElementById("stat-saved").textContent = money(totalSaved);
  document.getElementById("stat-atl").textContent = atl;
}

export function fillSelects() {
  // "All" stays first: sorting the whole list would bury it under "Action".
  const cats = ["All", ...[...new Set(deals.map((d) => d.c))].sort()];
  const catSel = document.getElementById("f-cat");
  catSel.innerHTML = cats.map((c) => '<option value="' + escapeHtml(c) + '">' + (c === "All" ? "All categories" : escapeHtml(c)) + "</option>").join("");
  const storeSel = document.getElementById("f-store");
  const stores = ["All", ...Object.keys(STORES)];
  storeSel.innerHTML = stores.map((s) => '<option value="' + s + '">' + (s === "All" ? "All stores" : STORES[s]) + "</option>").join("");
}

// Detail view for one deal: big price, evidence, and its cross-store table.
export function renderDetail(id) {
  const box = document.getElementById("detail");
  const d = deals.find((x) => x.id === id);
  if (!d) { box.hidden = true; box.innerHTML = ""; return; }
  const v = VERDICTS[d.v];
  const rows = [...d.mx].sort((a, b) => a[1] - b[1]).map(([code, sale, was]) => {
    const best = sale === d.p;
    const full = sale >= was;
    return '<tr class="' + (best ? "best" : full ? "full" : "") + '"><td>' + STORES[code] + '</td><td>' + money(sale) + '</td><td>' + money(was) + '</td><td>' +
      (full ? "No discount" : "-" + Math.round((1 - sale / was) * 100) + "%") + "</td></tr>";
  }).join("");
  box.innerHTML =
    '<button class="back" id="detail-back" type="button">← Back to all deals</button>' +
    '<span class="verdict ' + v.cls + '">' + v.label + '</span>' +
    "<h2>" + escapeHtml(d.t) + "</h2>" +
    '<p class="cat">' + escapeHtml(d.c) + " · " + STORES[d.s] + "</p>" +
    '<div class="detail-grid"><div>' +
    '<p><span class="big-price">' + money(d.p) + '</span> <span class="was">' + money(d.w) + '</span> <span class="off">-' + pctOf(d) + '%</span></p>' +
    '<p class="saved-line">You save ' + money(savedOf(d)) + ' · cheapest ever ' + money(d.ce) + '</p>' +
    "<p>" + evidenceOf(d) + "</p>" +
    (ratingLine(d) ? '<p class="ratings">' + ratingLine(d) + "</p>" : "") +
    "<p class=\"checked\">Checked " + CHECKED_LABEL + " · CheapShark" + (d.s === "ST" ? " + Steam store" : "") + "</p>" +
    '<p><a class="btn" href="' + d.u + '" target="_blank" rel="noopener">View at ' + STORES[d.s] + "</a></p>" +
    "</div><div><h3>Same game at the six tracked stores</h3>" +
    '<table class="mini-matrix"><thead><tr><th>Store</th><th>Price</th><th>Usual</th><th>Discount</th></tr></thead><tbody>' + rows + "</tbody></table>" +
    "<p class=\"checked\">Each store's own listed price, read at the same time. Green is the cheapest.</p>" +
    "</div></div>";
  box.hidden = false;
  document.getElementById("detail-back").addEventListener("click", () => {
    location.hash = "#/";
  });
  box.scrollIntoView({ behavior: "smooth", block: "start" });
}
