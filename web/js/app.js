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
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "tab";
    btn.setAttribute("role", "tab");
    btn.dataset.id = row.id;
    btn.innerHTML = `${row.title}<small>${row.tag}</small>`;
    btn.addEventListener("click", () => selectCase(row.id));
    wrap.appendChild(btn);
  });
}

function selectCase(id) {
  const data = bundles[id];
  if (!data) return;
  localStorage.setItem(STORAGE_KEY, id);

  document.querySelectorAll(".tab").forEach((el) => {
    el.classList.toggle("active", el.dataset.id === id);
  });

  document.getElementById("main").classList.remove("hidden");

  const meta = caseIndex.find((c) => c.id === id);
  document.getElementById("caseTag").textContent = meta ? meta.tag : data.type;
  document.getElementById("caseTitle").textContent = data.title;
  document.getElementById("caseSubtitle").textContent = data.subtitle || "";
  document.getElementById("caseContext").textContent = data.context || "";
  document.getElementById("beforeSummary").textContent = data.before_summary || "";
  document.getElementById("afterSummary").textContent = data.after_summary || "";

  const src = document.getElementById("caseSource");
  if (data.source_url) {
    src.innerHTML = `Source: <a href="${data.source_url}" target="_blank" rel="noopener">${data.source_label || data.source_url}</a> · ${data.organization || ""} · ${data.year || ""}`;
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
  kpis.forEach((row) => {
    const card = document.createElement("div");
    card.className = "kpi";
    card.innerHTML = `
      <div class="kpi-label">${row.label}</div>
      <div class="kpi-values">
        <span class="kpi-before">${row.before}</span>
        <span class="kpi-arrow">→</span>
        <span class="kpi-after">${row.after}</span>
      </div>
      <div class="kpi-unit">${row.unit || ""}</div>
    `;
    grid.appendChild(card);
  });
}

function renderSprints(sprints) {
  const chart = document.getElementById("sprintChart");
  const table = document.getElementById("sprintTable");
  chart.innerHTML = "";
  table.innerHTML = "";

  if (!sprints.length) {
    chart.textContent = "No sprint data for this case.";
    return;
  }

  const maxPts = Math.max(...sprints.map((s) => s.planned_points || 0), 1);

  sprints.forEach((s) => {
    const group = document.createElement("div");
    group.className = "bar-group";
    const plannedH = Math.round(((s.planned_points || 0) / maxPts) * 130);
    const doneH = Math.round(((s.done_points || 0) / maxPts) * 130);
    group.innerHTML = `
      <div class="bars">
        <div class="bar planned" style="height:${plannedH}px" title="planned ${s.planned_points}"></div>
        <div class="bar done" style="height:${doneH}px" title="done ${s.done_points}"></div>
      </div>
      <span class="bar-label">S${s.number}</span>
    `;
    chart.appendChild(group);
  });

  sprints.forEach((s) => {
    const pct = s.planned_points
      ? Math.round((100 * (s.done_points || 0)) / s.planned_points)
      : 0;
    const row = document.createElement("div");
    row.className = "sprint-row";
    row.innerHTML = `
      <span>Sprint ${s.number}</span>
      <span>${s.goal || ""}</span>
      <span>${s.done_points}/${s.planned_points} pts</span>
      <span>${pct}%</span>
    `;
    table.appendChild(row);
  });
}

function renderImpediments(items) {
  const list = document.getElementById("impedimentList");
  list.innerHTML = "";
  if (!items.length) {
    list.innerHTML = "<li>No impediments recorded.</li>";
    return;
  }
  items.forEach((imp) => {
    const li = document.createElement("li");
    const status = imp.status === "resolved" ? "resolved" : "open";
    li.innerHTML = `
      <span class="imp-status ${status}">${status}</span>
      <strong>${imp.title}</strong>
      <div style="color:var(--muted);font-size:0.82rem;margin-top:0.2rem">
        owner: ${imp.owner || "?"} · impact: ${imp.impact || "?"}
      </div>
    `;
    list.appendChild(li);
  });
}

function renderRetros(sessions) {
  const wrap = document.getElementById("retroList");
  wrap.innerHTML = "";
  if (!sessions.length) {
    wrap.textContent = "No retros on file.";
    return;
  }
  sessions.forEach((s) => {
    const block = document.createElement("div");
    block.className = "retro-block";
    const glad = (s.glad || []).join("; ");
    const sad = (s.sad || []).join("; ");
    const mad = (s.mad || []).join("; ");
    block.innerHTML = `
      <h4>Sprint ${s.sprint} · ${s.date || ""}</h4>
      <p class="retro-action">Action: ${s.action || ""}</p>
      <p class="retro-tags">glad: ${glad || "n/a"}</p>
      <p class="retro-tags">sad: ${sad || "n/a"}</p>
      <p class="retro-tags">mad: ${mad || "n/a"}</p>
    `;
    wrap.appendChild(block);
  });
}

function renderChanges(changes) {
  const list = document.getElementById("changeList");
  list.innerHTML = "";
  changes.forEach((text) => {
    const li = document.createElement("li");
    li.textContent = text;
    list.appendChild(li);
  });
}

boot();
