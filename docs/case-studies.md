# Case studies index

Four cases ship with this repo. One is from my own student team work. Three are public industry examples with sources linked in the dashboard and in each json file.

| ID | Title | Type |
|----|-------|------|
| `student-peer-review` | Master course software team | Personal |
| `ing-agile` | ING agile transformation | Industry |
| `spotify-squads` | Spotify engineering culture | Industry |
| `uk-gds` | UK Government Digital Service | Industry |

Industry headline metrics come from published articles and reports. Sprint rows and impediment samples are illustrative so the dashboard and CLI have a consistent shape across cases. Check the source link on each case before citing numbers in an interview.

## Dashboard

```bash
python src/run_dashboard.py
```

Opens http://127.0.0.1:8765/web/ with a case picker.

## CLI

```bash
python src/sprint_summary.py --case ing-agile kpis
python src/sprint_summary.py --case uk-gds overview
python src/impediment_tracker.py --case spotify-squads list
```
