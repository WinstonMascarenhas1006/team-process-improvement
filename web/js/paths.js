/** Resolve repo-root URLs for local server and GitHub Pages (/repo/web/). */
(function () {
  function webBasePath() {
    const path = window.location.pathname.replace(/\/+$/, "");
    const marker = "/web";
    const idx = path.indexOf(marker);
    if (idx >= 0) return path.slice(0, idx);
    return "";
  }

  window.REPO_BASE = webBasePath();

  window.assetUrl = function assetUrl(relativeFromRepoRoot) {
    const clean = String(relativeFromRepoRoot).replace(/^\/+/, "");
    const base = window.REPO_BASE || "";
    return `${base}/${clean}`.replace(/\/{2,}/g, "/");
  };

  window.webUrl = function webUrl(relativeFromWeb) {
    const clean = String(relativeFromWeb).replace(/^\/+/, "");
    return `${window.REPO_BASE}/web/${clean}`.replace(/\/{2,}/g, "/");
  };
})();
