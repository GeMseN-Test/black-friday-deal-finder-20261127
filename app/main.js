// DealHound boot — wires the controls, renders everything, routes #/deal/<id>.
import { renderGrid, renderStats, fillSelects, renderDetail, state } from "./finder.js";
import { renderMatrix, renderBasket, wireTools, refreshTray } from "./tools.js";

function route() {
  const hash = location.hash || "#/";
  const m = hash.match(/^#\/deal\/([\w-]+)$/);
  if (m) {
    renderDetail(m[1]);
    return;
  }
  const box = document.getElementById("detail");
  box.hidden = true;
  box.innerHTML = "";
  // #/lows opens the board with the all-time-low filter already on, so the
  // filtered state is a real view of the finder, not a mock-up.
  if (hash === "#/lows") {
    state.atlOnly = true;
    const toggle = document.getElementById("f-atl");
    toggle.checked = true;
    renderGrid();
  }
  if (hash === "#/budget") {
    document.getElementById("budget").scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function wireControls() {
  document.getElementById("q").addEventListener("input", (e) => {
    state.q = e.target.value;
    renderGrid();
  });
  document.getElementById("f-cat").addEventListener("change", (e) => {
    state.cat = e.target.value;
    renderGrid();
  });
  document.getElementById("f-store").addEventListener("change", (e) => {
    state.store = e.target.value;
    renderGrid();
  });
  document.getElementById("f-off").addEventListener("change", (e) => {
    state.minOff = Number(e.target.value);
    renderGrid();
  });
  document.getElementById("f-sort").addEventListener("change", (e) => {
    state.sort = e.target.value;
    renderGrid();
  });
  document.getElementById("f-atl").addEventListener("change", (e) => {
    state.atlOnly = e.target.checked;
    renderGrid();
  });
}

fillSelects();
wireControls();
wireTools();
renderStats();
renderGrid();
renderMatrix();
renderBasket();
refreshTray();
route();
window.addEventListener("hashchange", route);
