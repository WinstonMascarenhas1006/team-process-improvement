from pathlib import Path

p = Path(r"d:\CV-Projects\team-process-improvement\web\js\app.js")
t = p.read_text(encoding="utf-8")

if "function renderRoleFit" not in t:
    fn = '''
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
    <div class="card mb-4">
      <motion-wrap class="card-header">
        <h3 class="card-title"><i class="ti ti-briefcase"></i> Fit for Junior Scrum Master roles</h3>
        <span class="badge bg-azure-lt">${escapeHtml(roleFit.company_example || "")} · ${escapeHtml(roleFit.reference_id || "")}</span>
      </motion-wrap>
      <div class="card-body">
        <p class="mb-3">${escapeHtml(roleFit.summary || "")}</p>
        <div class="table-responsive">
          <table class="table table-vcenter table-sm role-fit-table mb-0">
            <thead><tr><th>Typical requirement</th><th>My evidence</th><th>Metric</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </motion-wrap>
        <p class="small text-secondary mt-3 mb-0">Industry tabs show cited public research — not claimed as my work.</p>
      </motion-wrap>
    </motion-wrap>
  `;
  el.classList.remove("hidden");
}

'''.replace("motion-wrap", "div")
    t = t.replace("\nfunction renderTimeline", fn + "\nfunction renderTimeline", 1)

# Update landing copy for recruiter journey
old_p = "Peer review app for a master software engineering course. Scroll for timeline"
new_p = "Peer review app for a master software engineering course. <a href=\"${caseStudyHref}\">Read the case study</a> first, then scroll for timeline"
if old_p in t and new_p not in t:
    t = t.replace(old_p, new_p)

if 'href="#analytics"' not in t and "Jump to analytics" not in t:
    t = t.replace(
        '<i class="ti ti-book"></i> Read case study</a>',
        '<i class="ti ti-book"></i> Case study</a>\n          <a class="btn btn-outline-primary" href="#analytics"><i class="ti ti-chart-bar"></i> Jump to analytics</a>',
    )
    t = t.replace(
        '<i class="ti ti-app-window"></i> Live demo</a>',
        '<i class="ti ti-player-play"></i> Run app locally</a>',
    )
    # only if still has Live demo label with demoLive branch - skip if complex

p.write_text(t, encoding="utf-8")
print("inserted", "function renderRoleFit" in t)
