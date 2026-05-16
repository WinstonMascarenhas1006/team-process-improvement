const INDEX_URL = "../data/cases/index.json";
const COMPARE_URL = "../data/compare-matrix.json";
const STORAGE_KEY = "process_dashboard_case";
const COMPARE_ID = "__compare__";

let caseIndex = [];
let bundles = {};
let compareData = null;

const PROOF_LABELS = {
  primary: { text: "Primary proof", class: "bg-green-lt" },
  verified_public: { text: "Verified public", class: "bg-blue-lt" },
  illustrative: { text: "Illustrative ops data", class: "bg-yellow-lt" },
};

async function boot() {
  try {
    const [indexRes, compareRes] = await Promise.all([
      fetch(INDEX_URL),
      fetch(COMPARE_URL),
    ]);
    if (!indexRes.ok) throw new Error("index missing");
    const data = await indexRes.json();
    caseIndex = data.cases || [];
    if (compareRes.ok) compareData = await compareRes.json();

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
    const start =
      saved === COMPARE_ID
        ? COMPARE_ID
        : caseIndex.find((c) => c.id === saved)
          ? saved
          : caseIndex[0].id;
    if (start === COMPARE_ID) showCompare();
    else selectCase(start);

    document.getElementById("loadError").classList.add("hidden");
  } catch (err) {
    document.getElementById("loadError").classList.remove("hidden");
    console.error(err);
  }
}

function buildTabs() {
  const wrap = document.getElementById("caseTabs");
  wrap.innerHTML = "";

  const compareLi = document.createElement("li");
  compareLi.className = "nav-item";
  const compareBtn = document.createElement("button");
  compareBtn.type = "button";
  compareBtn.className = "nav-link";
  compareBtn.dataset.id = COMPARE_ID;
  compareBtn.innerHTML = `Compare all<small>side by side</small>`;
  compareBtn.addEventListener("click", () => showCompare());
  compareLi.appendChild(compareBtn);
  wrap.appendChild(compareLi);

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

function setActiveTab(id) {
  document.querySelectorAll(".case-nav .nav-link").forEach((el) => {
    el.classList.toggle("active", el.dataset.id === id);
  });
}

function showCompare() {
  localStorage.setItem(STORAGE_KEY, COMPARE_ID);
  setActiveTab(COMPARE_ID);
  document.getElementById("main").classList.add("hidden");
  document.getElementById("compareView").classList.remove("hidden");
  renderCompare();
}

function selectCase(id) {
  const data = bundles[id];
  if (!data) return;
  localStorage.setItem(STORAGE_KEY, id);
  setActiveTab(id);

  document.getElementById("compareView").classList.add("hidden");
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

  renderTrust(data);
  renderEvidence(data.evidence || []);
  renderArtifacts(data.artifacts || []);
  renderKpis(data.kpis || []);
  renderSprints(data.sprints || [], data.trust);
  renderImpediments(data.impediments || [], data.trust);
  renderRetros(data.retros || []);
  renderChanges(data.changes || []);
}

function renderTrust(data) {
  const banner = document.getElementById("trustBanner");
  const kpiBadge = document.getElementById("trustKpiBadge");
  const opsBadge = document.getElementById("trustOpsBadge");

  const kpiLevel = data.trust?.headline_kpis || "verified_public";
  const opsLevel = data.trust?.operational_tables || "illustrative";

  kpiBadge.textContent = PROOF_LABELS[kpiLevel]?.text || kpiLevel;
  kpiBadge.classList.remove("hidden");

  if (opsLevel === "illustrative") {
    opsBadge.textContent = "Illustrative sprint data";
    opsBadge.classList.remove("hidden");
  } else {
    opsBadge.textContent = "Primary sprint data";
    opsBadge.classList.remove("hidden");
    opsBadge.classList.remove("bg-yellow-lt");
    opsBadge.classList.add("bg-green-lt");
  }

  if (data.operational_note) {
    banner.className = "alert alert-info mb-3";
    banner.textContent = data.operational_note;
    banner.classList.remove("hidden");
  } else {
    banner.classList.add("hidden");
  }

  const sprintBadge = document.getElementById("sprintOpsBadge");
  if (opsLevel === "illustrative") {
    sprintBadge.textContent = "illustrative ops";
    sprintBadge.className = "badge bg-yellow-lt";
  } else {
    sprintBadge.textContent = "primary team data";
    sprintBadge.className = "badge bg-green-lt";
  }
}

function renderEvidence(items) {
  const wrap = document.getElementById("evidenceList");
  wrap.innerHTML = "";
  if (!items.length) {
    wrap.innerHTML = "<p class=\"text-secondary mb-0\">No linked evidence for this case.</p>";
    return;
  }
  items.forEach((row, i) => {
    const proof = PROOF_LABELS[row.proof_level] || { text: row.proof_level, class: "bg-secondary-lt" };
    const block = document.createElement("div");
    block.className = "evidence-item" + (i < items.length - 1 ? " border-bottom pb-3 mb-3" : "");
    block.innerHTML = `
      <div class="d-flex flex-wrap gap-2 align-items-center mb-1">
        <span class="badge ${proof.class}">${proof.text}</span>
        <strong>${row.claim}</strong>
      </div>
      <blockquote class="evidence-quote mb-2">"${escapeHtml(row.excerpt || "")}"</blockquote>
      <p class="small text-secondary mb-0">
        <a href="${row.source_url}" target="_blank" rel="noopener">${row.source_title}</a>
      </p>
    `;
    wrap.appendChild(block);
  });
}

function renderArtifacts(items) {
  const card = document.getElementById("artifactsCard");
  const list = document.getElementById("artifactList");
  list.innerHTML = "";
  if (!items.length) {
    card.classList.add("hidden");
    return;
  }
  card.classList.remove("hidden");
  items.forEach((a) => {
    const li = document.createElement("a");
    li.className = "list-group-item list-group-item-action d-flex justify-content-between align-items-center";
    li.href = a.url;
    li.target = "_blank";
    li.rel = "noopener";
    li.innerHTML = `<span>${a.label}</span><span class="badge bg-azure-lt">${a.type}</span>`;
    list.appendChild(li);
  });
}

function renderCompare() {
  if (!compareData) return;
  document.getElementById("compareNote").textContent = compareData.note || "";

  const table = document.getElementById("compareTable");
  const cols = caseIndex.map((c) => c.id);
  const shortNames = {};
  caseIndex.forEach((c) => {
    shortNames[c.id] = c.title.split(" ")[0];
  });

  let html = "<thead><tr><th>Dimension</th>";
  cols.forEach((id) => {
    html += `<th>${caseIndex.find((c) => c.id === id)?.title || id}</th>`;
  });
  html += "</tr></thead><tbody>";

  (compareData.dimensions || []).forEach((row) => {
    html += `<tr><td><strong>${row.dimension}</strong></td>`;
    cols.forEach((id) => {
      const cell = row[id] || {};
      const proof = PROOF_LABELS[cell.proof] || {};
      html += `<td>
        <div class="compare-before text-red">${cell.before || ""}</div>
        <div class="compare-arrow">↓</div>
        <div class="compare-after text-green">${cell.after || ""}</div>
        <span class="badge ${proof.class || "bg-secondary-lt"} mt-1">${proof.text || ""}</span>
      </td>`;
    });
    html += "</tr>";
  });
  html += "</tbody>";
  table.innerHTML = html;
}

function renderKpis(kpis) {
  const grid = document.getElementById("kpiGrid");
  grid.innerHTML = "";
  const colors = ["bg-blue-lt", "bg-azure-lt", "bg-teal-lt", "bg-lime-lt"];
  kpis.forEach((row, i) => {
    const proof = PROOF_LABELS[row.proof_level] || null;
    const sourceLink = row.source_url
      ? `<a href="${row.source_url}" target="_blank" class="small">source</a>`
      : "";
    const col = document.createElement("div");
    col.className = "col-sm-6 col-lg-3";
    col.innerHTML = `
      <div class="card kpi-card ${colors[i % colors.length]}">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start gap-1">
            <div class="kpi-name">${row.label}</div>
            ${proof ? `<span class="badge ${proof.class}">${proof.text}</span>` : ""}
          </div>
          <div class="kpi-flow">
            <span class="kpi-before">${row.before}</span>
            <i class="ti ti-arrow-right text-secondary" style="font-size:0.9rem"></i>
            <span class="kpi-after">${row.after}</span>
          </div>
          <div class="kpi-unit">${row.unit || ""} ${sourceLink}</div>
        </div>
      </div>
    `;
    grid.appendChild(col);
  });
}

function renderSprints(sprints, trust) {
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
        <div class="chart-bar planned" style="height:${plannedH}px"></div>
        <div class="chart-bar done" style="height:${doneH}px"></div>
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
    .map((t) => `<span class="badge bg-secondary-lt">${label}: ${t}</span>`)
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

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

boot();
