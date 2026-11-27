// DealHound tools — the cross-store matrix, the budget basket builder and the
// head-to-head compare tray. All of it runs client-side on the checked data.
import { deals, STORES, CHECKED_LABEL } from "./deals.js";
import { money, pctOf, savedOf, evidenceOf, state, escapeHtml } from "./finder.js";

// Six games with the widest price gaps across the tracked stores.
const MATRIX_PICKS = ["109746", "206403", "93503", "198016", "158443", "249998"];

function matrixTable(d) {
  const rows = [...d.mx].sort((a, b) => a[1] - b[1]);
  const cheapest = rows[0][1];
  const priciest = rows[rows.length - 1][1];
  const gap = priciest - cheapest;
  const body = rows.map(([code, sale, was]) => {
    const full = sale >= was;
    return "<tr class=\"" + (sale === cheapest ? "best" : full ? "full" : "") + "\"><td>" + STORES[code] +
      "</td><td>" + money(sale) + "</td><td>" + money(was) + "</td><td>" +
      (full ? "No discount" : "-" + Math.round((1 - sale / was) * 100) + "%") + "</td></tr>";
  }).join("");
  return '<article class="matrix-card"><h3><a href="#/deal/' + d.id + '">' + escapeHtml(d.t) + "</a></h3>" +
    '<table class="mini-matrix"><thead><tr><th>Store</th><th>Price</th><th>Usual</th><th>Discount</th></tr></thead><tbody>' +
    body + "</tbody></table>" +
    '<p class="gap-note">Gap: <b>' + money(gap) + "</b> between the cheapest and the priciest store. Buying at " +
    STORES[rows[0][0]] + " instead of " + STORES[rows[rows.length - 1][0]] + " saves " + money(gap) + ".</p></article>";
}

export function renderMatrix() {
  const host = document.getElementById("matrix-tables");
  host.innerHTML = '<div class="matrix-grid">' +
    MATRIX_PICKS.map((id) => matrixTable(deals.find((d) => d.id === id))).join("") + "</div>";
}

// Budget basket: most saving per dollar first, all-time lows before the rest.
export function packBasket(budget) {
  const ranked = [...deals].sort((a, b) => {
    const valueA = savedOf(a) / a.p;
    const valueB = savedOf(b) / b.p;
    return a.v - b.v || valueB - valueA || savedOf(b) - savedOf(a);
  });
  const picked = [];
  let spent = 0;
  for (const d of ranked) {
    if (spent + d.p <= budget) { picked.push(d); spent += d.p; }
  }
  return { picked, spent };
}

export function renderBasket() {
  const input = document.getElementById("budget-input");
  const budget = Math.max(1, Number(input.value) || 0);
  const { picked, spent } = packBasket(budget);
  const saved = picked.reduce((a, d) => a + savedOf(d), 0);
  document.getElementById("budget-result").textContent =
    picked.length + " games for " + money(spent) + " of your " + money(budget) +
    " budget — you save " + money(saved) + " in total.";
  document.getElementById("budget-list").innerHTML = picked.map((d) =>
    "<li><span><a href=\"#/deal/" + d.id + "\">" + escapeHtml(d.t) + "</a> · " + STORES[d.s] +
    " · -" + pctOf(d) + "%</span><span>" + money(d.p) +
    ' <span class="b-save">save ' + money(savedOf(d)) + "</span></span></li>"
  ).join("");
}

// Compare tray: pick up to 3 deals, then a side-by-side table.
export function refreshTray() {
  const tray = document.getElementById("tray");
  const n = state.compare.size;
  tray.hidden = n === 0;
  document.getElementById("tray-count").textContent = n;
  document.querySelectorAll("[data-compare]").forEach((box) => {
    box.checked = state.compare.has(box.getAttribute("data-compare"));
  });
}

export function renderCompare() {
  const host = document.getElementById("compare");
  const picked = deals.filter((d) => state.compare.has(d.id));
  if (picked.length < 2) { host.hidden = true; host.innerHTML = ""; return; }
  const head = picked.map((d) => "<th>" + escapeHtml(d.t) + "</th>").join("");
  const row = (label, fn, win) => {
    const vals = picked.map(fn);
    const best = win ? Math.min(...vals.map((v) => v.n)) : Math.max(...vals.map((v) => v.n));
    return "<tr><th>" + label + "</th>" + vals.map((v) =>
      '<td class="' + (v.n === best ? "win" : "") + '">' + v.s + "</td>").join("") + "</tr>";
  };
  host.innerHTML = "<h2>Head to head</h2><p class=\"section-note\">Green is the best value in that row. Prices checked " +
    CHECKED_LABEL + ".</p><table><thead><tr><th></th>" + head + "</tr></thead><tbody>" +
    row("Store", (d) => ({ n: 0, s: STORES[d.s] }), false) +
    row("Sale price", (d) => ({ n: d.p, s: money(d.p) }), true) +
    row("Usual price", (d) => ({ n: d.w, s: money(d.w) }), false) +
    row("Discount", (d) => ({ n: pctOf(d), s: "-" + pctOf(d) + "%" }), false) +
    row("You save", (d) => ({ n: savedOf(d), s: money(savedOf(d)) }), false) +
    row("Cheapest ever", (d) => ({ n: d.ce, s: money(d.ce) }), true) +
    row("Verdict", (d) => ({ n: d.v, s: evidenceOf(d) }), true) +
    "<tr><th>Buy</th>" + picked.map((d) => '<td><a class="btn" href="' + d.u + '" target="_blank" rel="noopener">View at ' + STORES[d.s] + "</a></td>").join("") + "</tr>" +
    "</tbody></table>";
  host.hidden = false;
  host.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function wireTools() {
  document.getElementById("budget-go").addEventListener("click", renderBasket);
  document.getElementById("budget-input").addEventListener("change", renderBasket);
  document.getElementById("tray-show").addEventListener("click", renderCompare);
  document.getElementById("tray-clear").addEventListener("click", () => {
    state.compare.clear();
    document.getElementById("compare").hidden = true;
    document.getElementById("compare").innerHTML = "";
    refreshTray();
  });
  document.getElementById("grid").addEventListener("change", (e) => {
    const box = e.target.closest("[data-compare]");
    if (!box) return;
    const id = box.getAttribute("data-compare");
    if (box.checked) {
      if (state.compare.size >= 3) {
        box.checked = false;
        return;
      }
      state.compare.add(id);
    } else {
      state.compare.delete(id);
    }
    refreshTray();
  });
}
