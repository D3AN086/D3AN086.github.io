const KEY = "household-budget-v1";
const $ = (id) => document.getElementById(id);
const CATS = {
  Home: "#1a3329",
  Utilities: "#3d6b54",
  Food: "#b8883b",
  Transport: "#4d5e72",
  Insurance: "#6b5344",
  "Phone & internet": "#2c4d3f",
  Subscriptions: "#8a6a3a",
  Kids: "#8a3d36",
  Other: "#6b6358"
};

const state = load() || {
  name: "Household",
  currency: "£",
  incomes: [],
  bills: []
};

const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
$("monthLabel").textContent = months[new Date().getMonth()] + "  " + new Date().getFullYear();

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; }
}
function save() {
  localStorage.setItem(KEY, JSON.stringify(state));
  render();
}
function money(n, compact) {
  const num = Number(n) || 0;
  const digits = compact && Math.abs(num) >= 1000 ? 0 : 2;
  const abs = Math.abs(num).toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits });
  return (num < 0 ? "\u2212" : "") + state.currency + abs;
}
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 1800);
}

function totals() {
  const income = state.incomes.reduce((s, i) => s + Number(i.amount || 0), 0);
  const bills = state.bills.reduce((s, b) => s + Number(b.amount || 0), 0);
  const paid = state.bills.filter(b => b.paid).reduce((s, b) => s + Number(b.amount || 0), 0);
  const left = income - bills;
  const unpaid = bills - paid;
  const last = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const daysLeft = Math.max(1, last - new Date().getDate() + 1);
  const pct = income <= 0 ? 0 : Math.min(100, (bills / income) * 100);
  return { income, bills, paid, left, unpaid, daysLeft, daily: left / daysLeft, pct };
}

function render() {
  const name = state.name || "Household";
  $("homeTitle").textContent = name;
  $("mark").textContent = name.trim().charAt(0).toUpperCase() || "H";
  const t = totals();
  const hero = $("hero");
  hero.classList.toggle("over", t.left < 0);
  $("leftLabel").textContent = t.left < 0 ? "Short this month" : "Left after bills";
  $("leftAmount").textContent = money(t.left);
  $("incomeTotal").textContent = money(t.income, true);
  $("billsTotal").textContent = money(t.bills, true);
  $("paidTotal").textContent = money(t.paid, true);
  $("dailyLeft").textContent = money(Math.max(0, t.daily));
  $("stillToPay").textContent = money(t.unpaid);
  $("incomeCount").textContent = state.incomes.length;
  $("billsCount").textContent = state.bills.length;

  const circ = 2 * Math.PI * 34;
  $("ringFill").style.strokeDasharray = circ;
  $("ringFill").style.strokeDashoffset = String(circ - (circ * t.pct) / 100);
  $("ringFill").setAttribute("stroke", t.left < 0 ? "#f3b4ad" : "#e8c985");
  $("ringText").textContent = Math.round(t.pct) + "%";

  const chip = $("statusChip");
  if (!t.income && !t.bills) {
    chip.textContent = "Ready";
    chip.className = "status";
    $("barNote").textContent = "Add pay and bills to see the month clearly.";
  } else if (t.left < 0) {
    chip.textContent = "Over";
    chip.className = "status over";
    $("barNote").textContent = "Bills sit above income. Trim a few items or add missing pay.";
  } else if (t.pct >= 85) {
    chip.textContent = "Tight";
    chip.className = "status tight";
    $("barNote").textContent = Math.round(t.pct) + "% of pay is spoken for. " + money(t.daily) + " a day remains.";
  } else {
    chip.textContent = "Comfortable";
    chip.className = "status";
    $("barNote").textContent = Math.round(t.pct) + "% of pay goes to bills. " + money(t.daily) + " a day remains.";
  }

  const incomeList = $("incomeList");
  if (!state.incomes.length) {
    incomeList.innerHTML = `<div class="empty">Wages, benefits, or extra work — add each source.</div>`;
  } else {
    incomeList.innerHTML = state.incomes.map(i => `
      <div class="row">
        <div>
          <div class="who">${escapeHtml(i.name)}</div>
          <div class="muted">Each month</div>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <div class="amt">${money(i.amount)}</div>
          <div class="actions">
            <button class="tiny" onclick="editItem('income','${i.id}')">Edit</button>
            <button class="tiny danger" onclick="removeItem('income','${i.id}')">Remove</button>
          </div>
        </div>
      </div>
    `).join("");
  }

  const billsList = $("billsList");
  if (!state.bills.length) {
    billsList.innerHTML = `<div class="empty">Rent, electric, wifi, the food shop — add each one.</div>`;
  } else {
    billsList.innerHTML = state.bills.map(b => {
      const color = CATS[b.category] || CATS.Other;
      return `
      <div class="row">
        <div class="left">
          <div class="check ${b.paid ? "on" : ""}" onclick="togglePaid('${b.id}')">${b.paid ? "✓" : ""}</div>
          <div class="text">
            <div class="bill-name">${escapeHtml(b.name)}</div>
            <div class="muted"><span class="dot" style="background:${color}"></span>${escapeHtml(b.category || "Other")}${b.due ? " · due " + escapeHtml(b.due) : ""}</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <div class="amt ${b.paid ? "paid" : ""}">${money(b.amount)}</div>
          <div class="actions">
            <button class="tiny" onclick="editItem('bill','${b.id}')">Edit</button>
            <button class="tiny danger" onclick="removeItem('bill','${b.id}')">Remove</button>
          </div>
        </div>
      </div>`;
    }).join("");
  }

  $("summaryBox").textContent = summaryText();
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&','<':'<','>':'>','"':'"',"'":'&#39;'}[c]));
}

function summaryText() {
  const t = totals();
  const month = months[new Date().getMonth()];
  const lines = [
    (state.name || "Household") + " · " + month,
    "Income  " + money(t.income),
    "Bills     " + money(t.bills),
    (t.left < 0 ? "Short    " : "Left      ") + money(t.left),
    ""
  ];
  if (state.incomes.length) {
    lines.push("Pay");
    state.incomes.forEach(i => lines.push("• " + i.name + "  " + money(i.amount)));
    lines.push("");
  }
  if (state.bills.length) {
    lines.push("Bills");
    state.bills.forEach(b => lines.push((b.paid ? "✓ " : "• ") + b.name + "  " + money(b.amount)));
  }
  return lines.join("\n");
}

function openItem(kind, item) {
  $("editKind").value = kind;
  $("editId").value = item ? item.id : "";
  $("dialogEyebrow").textContent = kind === "bill" ? "Outgoing" : "Incoming";
  $("dialogTitle").textContent = item ? "Edit " + kind : (kind === "bill" ? "New bill" : "New income");
  $("itemName").value = item ? item.name : "";
  $("itemAmount").value = item ? item.amount : "";
  $("itemCat").value = item && item.category ? item.category : "Home";
  $("itemDue").value = item && item.due ? item.due : "";
  $("billExtras").classList.toggle("hidden", kind !== "bill");
  $("itemDialog").showModal();
  setTimeout(() => $("itemName").focus(), 50);
}

window.editItem = function(kind, id) {
  const list = kind === "bill" ? state.bills : state.incomes;
  openItem(kind, list.find(x => x.id === id));
};
window.removeItem = function(kind, id) {
  if (!confirm("Remove this?")) return;
  if (kind === "bill") state.bills = state.bills.filter(x => x.id !== id);
  else state.incomes = state.incomes.filter(x => x.id !== id);
  save();
};
window.togglePaid = function(id) {
  const b = state.bills.find(x => x.id === id);
  if (!b) return;
  b.paid = !b.paid;
  save();
};

$("addIncomeBtn").onclick = () => openItem("income");
$("addBillBtn").onclick = () => openItem("bill");
$("quickAdd").onclick = () => openItem("bill");
$("homeBtn").onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });

$("saveBtn").addEventListener("click", (e) => {
  e.preventDefault();
  const name = $("itemName").value.trim();
  const amount = Number(String($("itemAmount").value).replace(/,/g, ""));
  if (!name || !amount || amount < 0) { toast("Add a name and amount"); return; }
  const kind = $("editKind").value;
  const id = $("editId").value;
  if (kind === "bill") {
    const data = { id: id || uid(), name, amount, category: $("itemCat").value, due: $("itemDue").value.trim(), paid: false };
    const i = state.bills.findIndex(x => x.id === id);
    if (i >= 0) { data.paid = state.bills[i].paid; state.bills[i] = data; }
    else state.bills.push(data);
  } else {
    const data = { id: id || uid(), name, amount };
    const i = state.incomes.findIndex(x => x.id === id);
    if (i >= 0) state.incomes[i] = data;
    else state.incomes.push(data);
  }
  $("itemDialog").close();
  save();
});

$("settingsBtn").onclick = () => {
  $("houseName").value = state.name || "";
  $("currency").value = state.currency || "£";
  $("settingsDialog").showModal();
};
$("saveSettings").onclick = (e) => {
  e.preventDefault();
  state.name = $("houseName").value.trim() || "Household";
  state.currency = $("currency").value;
  $("settingsDialog").close();
  save();
};

$("shareNav").onclick = () => $("shareDialog").showModal();
$("closeShare").onclick = () => $("shareDialog").close();

$("copySummaryBtn").onclick = async () => {
  try { await navigator.clipboard.writeText(summaryText()); toast("Summary copied"); }
  catch { toast("Copy failed"); }
};
$("shareTextBtn").onclick = async () => {
  const text = summaryText();
  if (navigator.share) {
    try { await navigator.share({ title: state.name + " budget", text }); return; } catch {}
  }
  try { await navigator.clipboard.writeText(text); toast("Copied \u2014 paste in a message"); }
  catch { toast("Copy the box above"); }
};
$("exportBtn").onclick = () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "household-budget.json";
  a.click();
  toast("Backup downloaded");
};
$("importBtn").onclick = () => $("importFile").click();
$("importFile").onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!data || !Array.isArray(data.bills) || !Array.isArray(data.incomes)) throw new Error("bad");
      state.name = data.name || state.name;
      state.currency = data.currency || state.currency;
      state.incomes = data.incomes;
      state.bills = data.bills;
      save();
      $("shareDialog").close();
      toast("Budget loaded");
    } catch {
      toast("That file could not be read");
    }
  };
  reader.readAsText(file);
  e.target.value = "";
};

render();
