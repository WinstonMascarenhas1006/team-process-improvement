# team-process-improvement

**Agile facilitation portfolio** · [Winston Mascarenhas](https://github.com/WinstonMascarenhas1006)

Built for roles such as **Mercedes-Benz Werkstudent Junior Scrum Master (MER00042CZ)** — shows how I facilitated a real student team, with metrics and artifacts recruiters can verify.

---

## For recruiters (3 steps)

| Step | What you get | Open |
|------|----------------|------|
| **1** | **Case study** — context, what I changed, outcomes | [**Read case study**](web/case-study.html) |
| **2** | **Analytics dashboard** — KPIs, sprints, impediments, retros, timeline, GitHub | [**Open dashboard**](web/index.html) |
| **3** | **Delivery code** — peer review app the team shipped | [**Delivery repo**](https://github.com/WinstonMascarenhas1006/control-engineering-peer-correction) |

**JD mapping:** [docs/ROLE-FIT.md](docs/ROLE-FIT.md) · **Proof levels:** [docs/METHODOLOGY.md](docs/METHODOLOGY.md)

### Live site (GitHub Pages)

After Pages is enabled on `main`, the public URL is:

`https://winstonmascarenhas1006.github.io/team-process-improvement/`

Pin this repo on your GitHub profile with description: *Agile facilitation case study + metrics dashboard (Junior SM / MER00042CZ).*

---

## What the numbers show (primary case)

| Metric | Before | After |
|--------|--------|-------|
| Sprint completion | 62% (13/21 pts) | 100% (16/16 pts) |
| Planning duration | ~150 min | 90 min cap |
| Open impediments at sprint end | 2 | 0 |

Source: [data/cases/student-peer-review/case.json](data/cases/student-peer-review/case.json) — interactive charts in the dashboard.

---

## Repository layout

| Path | Purpose |
|------|---------|
| [`index.html`](index.html) | Recruiter landing page |
| [`web/`](web/) | Case study viewer + analytics dashboard |
| [`docs/case-study.md`](docs/case-study.md) | Full narrative |
| [`docs/ROLE-FIT.md`](docs/ROLE-FIT.md) | Requirement → evidence mapping |
| [`data/cases/`](data/cases/) | Case data (1 primary + 3 industry research) |
| [`src/`](src/) | Python CLI + local server |

---

## Run locally

```bash
python src/run_dashboard.py
```

Opens `http://127.0.0.1:8765/web/` (serves repo root so data + docs load).

**Delivery app (separate repo):** not on a public URL yet — `npm run dev` → http://localhost:3000. See [setup](https://github.com/WinstonMascarenhas1006/control-engineering-peer-correction#5-run-the-development-server).

---

## Honesty

| Content | Proof level |
|---------|-------------|
| Student team KPIs & sprint tables | **Primary** — my facilitation, consistent JSON |
| Delivery repo commits | **Public GitHub** |
| ING / Spotify / GDS | **Verified public** headlines; sprint rows **illustrative** for comparison |

---

## CLI

```bash
python src/sprint_summary.py --case student-peer-review overview
python src/impediment_tracker.py --case student-peer-review list
```

---

MIT License
