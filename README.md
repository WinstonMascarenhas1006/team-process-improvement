# team-process-improvement

**CV project** · local folder: `d:\CV-Projects\team-process-improvement`  
Author: [Winston Mascarenhas](https://github.com/WinstonMascarenhas1006)

## What this is

During a master level software engineering group project, our team wrote good code but worked in a messy way. Long meetings, silent blockers, last minute demos. I stepped into a facilitation role and introduced a small agile routine: short dailies, capped planning, retros with one action, and a shared impediment list.

This repository is the portfolio piece for that work. You get the written case study, meeting templates, sample data from three sprints, and a few Python scripts that kept our notes in one place.

Read the full story in [`docs/case-study.md`](docs/case-study.md).

## Why it matters for software engineering

Software engineering is not only implementation. Teams ship through process: backlog clarity, feedback loops, quality gates, and steady delivery. This project shows I can improve those factors with simple habits and light tooling, which is relevant for agile roles in industry (including environments with CI pipelines and interdisciplinary teams).

## Repo layout

```
docs/case-study.md          before/after write up
templates/                  working agreement, retro guide
data/                       sample json from our sprints
src/impediment_tracker.py   log and close blockers
src/retro_board.py          mad/sad/glad notes
src/sprint_summary.py       sprint report for reviews
src/storage.py              shared json helpers
```

## Quick start

Requires Python 3.10+ (stdlib only).

```bash
cd d:\CV-Projects\team-process-improvement

python src/impediment_tracker.py list
python src/impediment_tracker.py add "Waiting on API keys" --owner alex --impact high

python src/retro_board.py list

python src/sprint_summary.py overview
python src/sprint_summary.py report 2
```

Edit files under `data/` directly if you prefer a spreadsheet style workflow.

## Sample outcome

Sprint delivery improved over three iterations (see `data/sprints.json`). Planning time and open impediments at sprint end went down once we tracked blockers openly and acted on retro actions.

## Related work

Other repos on my profile cover implementation (portfolio site, log analysis, peer correction tooling). This one is deliberately about **team process**, not feature code.

## License

MIT. Use the templates in your own student or volunteer teams if helpful.
