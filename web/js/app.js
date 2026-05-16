const INDEX_URL = "../data/cases/index.json";
const STORAGE_KEY = "process_dashboard_case";

let caseIndex = [];
let bundles = {};

async function boot() {
  try {
    const res = await fetch(INDEX_URL);
    if (!res.ok) throw new Error("index missing");
    const data = await res.json();
    caseIndex = data.cases || [];
    await Promise.all(
      caseIndex.map(async (row) => {
        const path = `../data/cases/${row.file}`;
        const r = await fetch(path);
        if (!r.ok) throw new Error(row.id);
        bundles[row.id] = await r.json();
      })
    );
    buildTabs();
    const saved = localStorage.getItem(STORAGE_KEY);
    const start = caseIndex.find((c) => c.id === saved) ? saved : caseIndex[0].id;
    selectCase(start);
    document.getElementById("loadError").classList.add("hidden");
  } catch (err) {
    document.getElementById("loadError").classList.remove("hidden");
    console.error(err);
  }
}

function buildTabs() {
  const wrap = document.getElementById("caseTabs");
  wrap.innerHTML = "";
  caseIndex.forEach((row) => {
    const li = document.createElement("li");
    li.className = "nav-item";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "nav-link";
    btn.setAttribute("role", "tab");
    btn.dataset.id = row.id;
    btn.innerHTML = `${row.title}<small>${row.tag}</small>`;
    btn.addEventListener("click", () => selectCase(row.id));
    li.appendChild(btn);
    wrap.appendChild(li);
  });
}

function selectCase(id) {
  const data = bundles[id];
  if (!data) return;
  localStorage.setItem(STORAGE_KEY, id);

  document.querySelectorAll(".case-nav .nav-link").forEach((el) => {
    el.classList.toggle("active", el.dataset.id === id);
  });

  document.getElementById("main").classList.remove("hidden");

  const meta = caseIndex.find((c) => c.id === id);
  document.getElementById("caseTag").textContent = meta ? meta.tag : data.type || "Case";
  document.getElementById("caseMeta").textContent = [data.organization, data.year, data.region]
    .filter(Boolean)
    .join(" · ");
  document.getElementById("caseTitle").textContent = data.title;
  document.getElementById("caseSubtitle").textContent = data.subtitle || "";
  document.getElementById("caseContext").textContent = data.context || "";
  document.getElementById("beforeSummary").textContent = data.before_summary || "";
  document.getElementById("afterSummary").textContent = data.after_summary || "";

  const src = document.getElementById("caseSource");
  if (data.source_url) {
    src.innerHTML = `Source: <a href="${data.source_url}" target="_blank" rel="noopener">${data.source_label || "link"}</a>`;
  } else {
    src.textContent = data.source_label || "";
  }

  renderKpis(data.kpis || []);
  renderSprints(data.sprints || []);
  renderImpediments(data.impediments || []);
  renderRetros(data.retros || []);
  renderChanges(data.changes || []);
}

function renderKpis(kpis) {
  const grid = document.getElementById("kpiGrid");
  grid.innerHTML = "";
  const colors = ["bg-blue-lt", "bg-azure-lt", "bg-teal-lt", "bg-lime-lt"];
  kpis.forEach((row, i) => {
    const col = document.createElement("div");
    col.className = "col-sm-6 col-lg-3";
    col.innerHTML = `
      <div class="card kpi-card ${colors[i % colors.length]}">
        <div class="card-body">
          <div class="kpi-name">${row.label}</div>
          <div class="kpi-flow">
            <span class="kpi-before">${row.before}</span>
            <i class="ti ti-arrow-right text-secondary" style="font-size:0.9rem"></i>
            <span class="kpi-after">${row.after}</span>
          </div>
          <div class="kpi-unit">${row.unit || ""}</div>
        </div>
      </div>
    `;
    grid.appendChild(col);
  });
}

function renderSprints(sprints) {
  const chart = document.getElementById("sprintChart");
  const tbody = document.getElementById("sprintTableBody");
  chart.innerHTML = "";
  tbody.innerHTML = "";

  if (!sprints.length) {
    chart.innerHTML = '<p class="text-secondary text-center w-100">No sprint data.</p>';
    return;
  }

  const maxPts = Math.max(...sprints.map((s) => s.planned_points || 0), 1);

  const legend = document.createElement("div");
  legend.className = "chart-legend";
  legend.innerHTML = '<span class="legend-planned">Planned</span><span class="legend-done">Done</span>';

  sprints.forEach((s) => {
    const plannedH = Math.round(((s.planned_points || 0) / maxPts) * 130);
    const doneH = Math.round(((s.done_points || 0) / maxPts) * 130);
    const col = document.createElement("div");
    col.className = "chart-col";
    col.innerHTML = `
      <div class="chart-bars">
        <div class="chart-bar planned" style="height:${plannedH}px" title="planned ${s.planned_points}"></div>
        <div class="chart-bar done" style="height:${doneH}px" title="done ${s.done_points}"></div>
      </div>
      <div class="chart-label">Sprint ${s.number}</div>
    `;
    chart.appendChild(col);

    const pct = s.planned_points
      ? Math.round((100 * (s.done_points || 0)) / s.planned_points)
      : 0;
    const tr = document.createElement("tr");
    const pctClass = pct >= 90 ? "text-green" : pct >= 70 ? "" : "text-red";
    tr.innerHTML = `
      <td><span class="badge bg-secondary-lt">S${s.number}</span></td>
      <td>${s.goal || ""}</td>
      <td class="text-end">${s.done_points}/${s.planned_points}</td>
      <td class="text-end ${pctClass}"><strong>${pct}%</strong></td>
    `;
    tbody.appendChild(tr);
  });

  chart.appendChild(legend);
}

function renderImpediments(items) {
  const tbody = document.getElementById("impedimentList");
  tbody.innerHTML = "";
  if (!items.length) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-secondary">No impediments recorded.</td></tr>';
    return;
  }
  items.forEach((imp) => {
    const open = imp.status !== "resolved";
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><span class="badge ${open ? "bg-red-lt" : "bg-green-lt"}">${open ? "open" : "resolved"}</span></td>
      <td>${imp.title}</td>
      <td>${imp.owner || "?"}</td>
      <td><span class="badge bg-yellow-lt">${imp.impact || "?"}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function renderRetros(sessions) {
  const wrap = document.getElementById("retroList");
  wrap.innerHTML = "";
  if (!sessions.length) {
    wrap.innerHTML = '<p class="text-secondary mb-0">No retros on file.</p>';
    return;
  }
  sessions.forEach((s) => {
    const block = document.createElement("div");
    block.className = "retro-item";
    block.innerHTML = `
      <h4>Sprint ${s.sprint} <span class="text-secondary fw-normal">· ${s.date || ""}</span></h4>
      <p class="retro-action mb-0"><strong>Action:</strong> ${s.action || ""}</p>
      <div class="retro-pills">
        ${pill("glad", s.glad)}
        ${pill("sad", s.sad)}
        ${pill("mad", s.mad)}
      </div>
    `;
    wrap.appendChild(block);
  });
}

function pill(label, items) {
  const list = items || [];
  if (!list.length) return "";
  return list
    .map(
      (t) =>
        `<span class="badge bg-secondary-lt text-secondary-fg">${label}: ${t}</span>`
    )
    .join("");
}

function renderChanges(changes) {
  const list = document.getElementById("changeList");
  list.innerHTML = "";
  changes.forEach((text) => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex align-items-start gap-2";
    li.innerHTML = `<i class="ti ti-check text-green mt-1"></i><span>${text}</span>`;
    list.appendChild(li);
  });
}

boot();
