const KEY = "household-budget-v1";
function $(id) { return document.getElementById(id); }

const state = load() || { name: "Household", currency: "\u00a3", incomes: [], bills: [] };
const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
$("monthLabel").textContent = months[new Date().getMonth()] + " " + new Date().getFullYear();

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)); }
  catch (e) { return null; }
}
function save() {
  localStorage.setItem(KEY, JSON.stringify(state));
  render();
}
function money(n, compact) {
  const num = Number(n) || 0;
  const digits = compact && Math.abs(num) >= 1000 ? 0 : 2;
  const abs = Math.abs(num).toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits });
  return (num < 0 ? "-" : "") + state.currency + abs;
}
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(function () { t.classList.remove("show"); }, 1600);
}
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, """)
    .replace(/'/g, "&#39;");
}
function totals() {
  const income = state.incomes.reduce(function (s, i) { return s + Number(i.amount || 0); }, 0);
  const bills = state.bills.reduce(function (s, b) { return s + Number(b.amount || 0); }, 0);
  const paid = state.bills.filter(function (b) { return b.paid; }).reduce(function (s, b) { return s + Number(b.amount || 0); }, 0);
  const last = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const daysLeft = Math.max(1, last - new Date().getDate() + 1);
  const left = income - bills;
  const pct = income <= 0 ? 0 : Math.min(100, (bills / income) * 100);
  return { income: income, bills: bills, paid: paid, unpaid: bills - paid, left: left, daily: left / daysLeft, pct: pct };
}
function render() {
  const name = state.name || "Household";
  $("homeTitle").textContent = name;
  $("mark").textContent = name.trim().charAt(0).toUpperCase() || "H";
  const t = totals();
  $("hero").classList.toggle("over", t.left < 0);
  $("leftLabel").textContent = t.left < 0 ? "Short this month" : "Left after bills";
  $("leftAmount").textContent = money(t.left);
  $("incomeTotal").textContent = money(t.income, true);
  $("billsTotal").textContent = money(t.bills, true);
  $("stillToPay").textContent = money(t.unpaid, true);
  $("dailyLeft").textContent = money(Math.max(0, t.daily), true);
  $("incomeCount").textContent = state.incomes.length + (state.incomes.length === 1 ? " source" : " sources");
  $("billsCount").textContent = state.bills.length + (state.bills.length === 1 ? " item" : " items");
  $("paidNote").textContent = t.paid ? money(t.paid, true) + " paid" : "none paid";
  const chip = $("statusChip");
  if (!t.income && !t.bills) { chip.textContent = "Ready"; chip.className = "chip"; }
  else if (t.left < 0) { chip.textContent = "Over"; chip.className = "chip over"; }
  else if (t.pct >= 85) { chip.textContent = "Tight"; chip.className = "chip tight"; }
  else { chip.textContent = "Clear"; chip.className = "chip"; }

  if (!state.incomes.length) {
    $("incomeList").innerHTML = '<div class="empty">Add each wage.</div>';
  } else {
    $("incomeList").innerHTML = state.incomes.map(function (i) {
      return '<div class="row pay"><div><div class="name">' + escapeHtml(i.name) + '</div><div class="meta">each month</div></div><div style="display:flex;align-items:center;gap:4px"><div class="amt">' + money(i.amount) + '</div><button class="tiny" data-edit="income:' + i.id + '">Edit</button><button class="tiny danger" data-del="income:' + i.id + '">x</button></div></div>';
    }).join("");
  }

  if (!state.bills.length) {
    $("billsList").innerHTML = '<div class="empty">Add rent, utilities, food.</div>';
  } else {
    $("billsList").innerHTML = state.bills.map(function (b) {
      return '<div class="row"><div class="check' + (b.paid ? " on" : "") + '" data-paid="' + b.id + '">' + (b.paid ? "v" : "") + '</div><div><div class="name">' + escapeHtml(b.name) + '</div><div class="meta">' + escapeHtml(b.category || "Other") + (b.due ? " \u00b7 " + escapeHtml(b.due) : "") + '</div></div><div style="display:flex;align-items:center;gap:4px"><div class="amt' + (b.paid ? " paid" : "") + '">' + money(b.amount) + '</div><button class="tiny" data-edit="bill:' + b.id + '">Edit</button><button class="tiny danger" data-del="bill:' + b.id + '">x</button></div></div>';
    }).join("");
  }
  $("summaryBox").textContent = summaryText();
}
function summaryText() {
  const t = totals();
  const lines = [
    (state.name || "Household") + " \u00b7 " + months[new Date().getMonth()],
    "Income  " + money(t.income),
    "Bills  " + money(t.bills),
    (t.left < 0 ? "Short  " : "Left  ") + money(t.left),
    ""
  ];
  state.incomes.forEach(function (i) { lines.push("- " + i.name + "  " + money(i.amount)); });
  if (state.incomes.length && state.bills.length) lines.push("");
  state.bills.forEach(function (b) { lines.push((b.paid ? "v " : "- ") + b.name + "  " + money(b.amount)); });
  return lines.join("\n");
}
function openItem(kind, item) {
  $("editKind").value = kind;
  $("editId").value = item ? item.id : "";
  $("dialogEyebrow").textContent = kind === "bill" ? "Outgoing" : "Incoming";
  $("dialogTitle").textContent = item ? "Edit" : (kind === "bill" ? "New bill" : "New income");
  $("itemName").value = item ? item.name : "";
  $("itemAmount").value = item ? item.amount : "";
  $("itemCat").value = item && item.category ? item.category : "Home";
  $("itemDue").value = item && item.due ? item.due : "";
  $("billExtras").classList.toggle("hidden", kind !== "bill");
  $("itemDialog").showModal();
  setTimeout(function () { $("itemName").focus(); }, 40);
}

$("addIncomeBtn").onclick = function () { openItem("income"); };
$("addBillBtn").onclick = function () { openItem("bill"); };
$("saveBtn").onclick = function (e) {
  e.preventDefault();
  const name = $("itemName").value.trim();
  const amount = Number(String($("itemAmount").value).replace(/,/g, ""));
  if (!name || !amount) { toast("Add a name and amount"); return; }
  const kind = $("editKind").value;
  const id = $("editId").value;
  if (kind === "bill") {
    const data = { id: id || uid(), name: name, amount: amount, category: $("itemCat").value, due: $("itemDue").value.trim(), paid: false };
    const i = state.bills.findIndex(function (x) { return x.id === id; });
    if (i >= 0) { data.paid = state.bills[i].paid; state.bills[i] = data; }
    else state.bills.push(data);
  } else {
    const data = { id: id || uid(), name: name, amount: amount };
    const i = state.incomes.findIndex(function (x) { return x.id === id; });
    if (i >= 0) state.incomes[i] = data;
    else state.incomes.push(data);
  }
  $("itemDialog").close();
  save();
};
$("settingsBtn").onclick = function () {
  $("houseName").value = state.name || "";
  $("currency").value = state.currency || "\u00a3";
  $("settingsDialog").showModal();
};
$("saveSettings").onclick = function (e) {
  e.preventDefault();
  state.name = $("houseName").value.trim() || "Household";
  state.currency = $("currency").value;
  $("settingsDialog").close();
  save();
};
$("shareNav").onclick = function () { $("shareDialog").showModal(); };
$("closeShare").onclick = function () { $("shareDialog").close(); };
$("copySummaryBtn").onclick = async function () {
  try { await navigator.clipboard.writeText(summaryText()); toast("Copied"); }
  catch (e) { toast("Copy failed"); }
};
$("shareTextBtn").onclick = async function () {
  const text = summaryText();
  if (navigator.share) {
    try { await navigator.share({ title: state.name + " budget", text: text }); return; }
    catch (e) {}
  }
  try { await navigator.clipboard.writeText(text); toast("Copied"); }
  catch (e) {}
};
$("exportBtn").onclick = function () {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], { type: "application/json" }));
  a.download = "household-budget.json";
  a.click();
  toast("Downloaded");
};
$("importBtn").onclick = function () { $("importFile").click(); };
$("importFile").onchange = function (e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function () {
    try {
      const data = JSON.parse(reader.result);
      if (!Array.isArray(data.bills) || !Array.isArray(data.incomes)) throw new Error("bad");
      state.name = data.name || state.name;
      state.currency = data.currency || state.currency;
      state.incomes = data.incomes;
      state.bills = data.bills;
      save();
      $("shareDialog").close();
      toast("Loaded");
    } catch (err) { toast("Could not read file"); }
  };
  reader.readAsText(file);
  e.target.value = "";
};

document.addEventListener("click", function (e) {
  const paid = e.target.closest("[data-paid]");
  if (paid) {
    const b = state.bills.find(function (x) { return x.id === paid.getAttribute("data-paid"); });
    if (b) { b.paid = !b.paid; save(); }
    return;
  }
  const edit = e.target.closest("[data-edit]");
  if (edit) {
    const parts = edit.getAttribute("data-edit").split(":");
    const list = parts[0] === "bill" ? state.bills : state.incomes;
    openItem(parts[0], list.find(function (x) { return x.id === parts[1]; }));
    return;
  }
  const del = e.target.closest("[data-del]");
  if (del) {
    if (!confirm("Remove this?")) return;
    const parts = del.getAttribute("data-del").split(":");
    if (parts[0] === "bill") state.bills = state.bills.filter(function (x) { return x.id !== parts[1]; });
    else state.incomes = state.incomes.filter(function (x) { return x.id !== parts[1]; });
    save();
  }
});

render();
