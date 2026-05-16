# team-process-improvement

**CV project** · `d:\CV-Projects\team-process-improvement`  
Author: [Winston Mascarenhas](https://github.com/WinstonMascarenhas1006)

## What this is

A small toolkit plus **interactive dashboard** for comparing **four** process improvement case studies:

1. **Student software team** (my own facilitation notes)
2. **[ING](https://www.ing.com/Newsroom/News/INGs-agile-transformation.htm)** agile transformation
3. **[Spotify](https://engineering.atspotify.com/2020/03/spotify-engineering-culture-part-1/)** squads and engineering culture
4. **[UK Government Digital Service](https://www.gov.uk/government/organisations/government-digital-service)** iterative public services

Pick a case in the UI or with `--case` on the CLI. KPIs, sprints, impediments and retros update for that story.

## Is this real proof?

**Honestly:** partly yes, partly no. The dashboard now labels each section.

| What | Proof level |
|------|-------------|
| Student team KPIs (62% → 100% points) | **Primary** — math matches `data/cases/student-peer-review/case.json` |
| Student repo + templates | **Artifacts** — links on the dashboard |
| ING / Spotify / GDS headline KPIs | **Verified public** — quoted excerpts + McKinsey, ING, GDS, Spotify links |
| Industry sprint & impediment tables | **Illustrative** — shaped for comparison, not leaked internal data |

Use the **Compare all** tab for side by side before/after across cases. Read [`docs/METHODOLOGY.md`](docs/METHODOLOGY.md) before interviews.

## Godmode dashboard

```bash
python src/run_dashboard.py
```

Browser opens at `http://127.0.0.1:8765/web/`. Use the tabs to switch cases. Your last choice is remembered in local storage.

## CLI (all cases)

```bash
python src/sprint_summary.py --case ing-agile kpis
python src/sprint_summary.py --case student-peer-review overview
python src/impediment_tracker.py --case uk-gds list
python src/retro_board.py --case spotify-squads list
```

Default case is `student-peer-review`.

## Why it matters

Software engineering includes how teams deliver, not only code. This repo links coursework style agile practice to well known industry transformations. Useful for Scrum Master or agile working student applications.

## Layout

```
web/                    dashboard (HTML + JS)
data/cases/             one json bundle per case study
docs/case-studies.md    index and notes on sources
src/                    CLI tools and run_dashboard.py
templates/              working agreement, retro guide
```

## Sources and honesty

Industry KPIs are summarized from public material linked in each case json. Sprint and impediment tables are structured examples so every case works the same in the app. Say that clearly in interviews.

## License

MIT
