import re
from pathlib import Path

ROOT = Path(r"d:\CV-Projects\team-process-improvement")
app_path = ROOT / "web/js/app.js"
app = app_path.read_text(encoding="utf-8")

app = app.replace("motion-wrap", "div")
app = re.sub(r"^\s*\w+\.innerHTML = \w+\.innerHTML\.replace\([^)]+\);\n", "", app, flags=re.M)

app = re.sub(r"const INDEX_URL = [^\n]+\nconst COMPARE_URL = [^\n]+\n", "", app, count=1)
if "let roleFit = null" not in app:
    app = app.replace("let compareData = null;", "let compareData = null;\nlet roleFit = null;")

app = app.replace(
    """async function boot() {
  try {
    const [indexRes, compareRes] = await Promise.all([
      fetch(INDEX_URL),
      fetch(COMPARE_URL),
    ]);""",
    """async function boot() {
  try {
    const [indexRes, compareRes, roleRes] = await Promise.all([
      fetch(assetUrl("data/cases/index.json")),
      fetch(assetUrl("data/compare-matrix.json")),
      fetch(assetUrl("data/role-fit.json")),
    ]);""",
)

app = app.replace(
    "if (compareRes.ok) compareData = await compareRes.json();",
    "if (compareRes.ok) compareData = await compareRes.json();\n    if (roleRes.ok) roleFit = await roleRes.json();",
)

app = app.replace(
    "const path = `../data/cases/${row.file}`;",
    "const path = assetUrl(`data/cases/${row.file}`);",
)

landing = r"function renderPrimaryLanding\(data\) \{.*?\n\}\n\nfunction renderTimeline"
new_block = '''function renderPrimaryLanding(data) {
  const box = document.getElementById("primaryLanding");
  const gh = data.github_activity || {};
  const caseStudyHref = data.case_study_url || "case-study.html";
  const caseStudyGithub =
    data.case_study_github_url ||
    "https://github.com/WinstonMascarenhas1006/team-process-improvement/blob/main/docs/case-study.md";
  const demoUrl = (data.demo_url || gh.demo_url || "").trim();
  const demoLive = data.demo_status === "live" && demoUrl;
  const demoSetup =
    data.demo_setup_url ||
    "https://github.com/WinstonMascarenhas1006/control-engineering-peer-correction#5-run-the-development-server";
  const demoNote =
    data.demo_note ||
    "Delivery app: clone the repo and run npm run dev (localhost:3000).";

  box.innerHTML = `
    <div class="card card-hero-primary">
      <motion-wrap class="card-body">
        <span class="badge bg-green-lt mb-2">★ Primary case · your proof</span>
        <h2 class="case-title mb-2">Where I acted as Scrum-style facilitator</h2>
        <p class="mb-3">Peer review app for a master software engineering course.
          <a href="${caseStudyHref}">Read the case study</a> first, then explore the analytics below.</p>
        <div class="d-flex flex-wrap gap-2">
          <a class="btn btn-primary" href="${caseStudyHref}"><i class="ti ti-book"></i> Case study</a>
          <a class="btn btn-outline-primary" href="#analytics"><i class="ti ti-chart-bar"></i> Jump to analytics</a>
          <a class="btn btn-outline-primary" href="${gh.repo_url || "#"}" target="_blank" rel="noopener"><i class="ti ti-brand-github"></i> Delivery repo</a>
          ${
            demoLive
              ? `<a class="btn btn-outline-secondary" href="${demoUrl}" target="_blank" rel="noopener"><i class="ti ti-app-window"></i> Live app</a>`
              : `<a class="btn btn-outline-secondary" href="${demoSetup}" target="_blank" rel="noopener"><i class="ti ti-player-play"></i> Run app locally</a>`
          }
        </motion-wrap>
        ${demoLive ? "" : `<p class="small text-secondary mt-2 mb-0">${escapeHtml(demoNote)}</p>`}
        <p class="small text-secondary mt-2 mb-0"><a href="${caseStudyGithub}" target="_blank" rel="noopener">Case study on GitHub</a></p>
      </motion-wrap>
    </motion-wrap>
  `;
}

function renderRoleFit() {
  const el = document.getElementById("roleFitPanel");
  if (!el || !roleFit) return;
  const rows = (roleFit.requirements || [])
    .map(
      (r) => `<tr>
      <td><strong>${escapeHtml(r.jd_theme)}</strong></td>
      <td>${escapeHtml(r.my_evidence)}</td>
      <td><span class="badge bg-green-lt">${escapeHtml(r.metric || "")}</span></td>
    </tr>`
    )
    .join("");
  el.innerHTML = `
    <div class="card mb-4" id="roleFit">
      <div class="card-header">
        <h3 class="card-title"><i class="ti ti-briefcase"></i> Fit for Junior Scrum Master roles</h3>
        <span class="badge bg-azure-lt">${escapeHtml(roleFit.company_example || "")} · ${escapeHtml(roleFit.reference_id || "")}</span>
      </div>
      <div class="card-body">
        <p class="mb-3">${escapeHtml(roleFit.summary || "")}</p>
        <div class="table-responsive">
          <table class="table table-vcenter table-sm role-fit-table mb-0">
            <thead><tr><th>Typical requirement</th><th>My evidence</th><th>Metric</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        <p class="small text-secondary mt-3 mb-0">Industry tabs show cited public research for comparison — not claimed as my work.</p>
      </div>
    </motion-wrap>
  `;
  el.classList.remove("hidden");
}

function renderTimeline'''
app = re.sub(landing, new_block.replace("motion-wrap", "div"), app, count=1)

if "renderRoleFit();" not in app:
    app = app.replace(
        "  if (isPrimary) {\n    renderPrimaryLanding(data);",
        '  document.getElementById("roleFitPanel")?.classList.toggle("hidden", !isPrimary);\n  if (isPrimary) {\n    renderRoleFit();\n    renderPrimaryLanding(data);',
    )

app_path.write_text(app, encoding="utf-8")
print("done", "assetUrl" in app, "renderRoleFit" in app)
