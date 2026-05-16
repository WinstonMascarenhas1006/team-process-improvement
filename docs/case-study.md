# Case study: fixing how a student dev team worked

> **Recruiters:** After reading this page, open the [**analytics dashboard**](../web/index.html) for KPIs, sprint data, impediments, retros, timeline, and GitHub activity. See [**ROLE-FIT.md**](ROLE-FIT.md) for Junior Scrum Master / Mercedes-Benz MER00042CZ mapping.

## Context

Five master students built a peer review tool for a software engineering course. The code was fine most weeks, but coordination was not. Meetings ran long, blockers hid in chat, and sprint goals changed mid week without anyone writing it down.

I was not the main developer. I focused on how the team worked. That is close to a Scrum Master style role even if we did not use every Scrum ceremony on day one.

## Before

| Topic | What we saw |
|-------|-------------|
| Planning | Often 2+ hours, unclear outcomes |
| Blockers | Mentioned in Slack, easy to forget |
| Quality | Tests skipped when deadlines got close |
| Review prep | Scramble the night before demo |

## What we changed (lightweight agile)

Week by week we added:

1. A written working agreement (see `templates/working_agreement.md`)
2. A 15 minute daily, same time, three questions only
3. An impediment log (see `data/impediments.json` and `src/impediment_tracker.py`)
4. A retro every two weeks with one action item only
5. A short sprint summary before each course demo

We did not buy tools. GitHub Issues for backlog, json files and small Python scripts for notes, Google Meet for ceremonies.

## After (three sprints)

Numbers from `data/sprints.json`:

| Sprint | Planned pts | Done pts | Open impediments at end |
|--------|-------------|----------|-------------------------|
| 1 | 21 | 13 | 2 |
| 2 | 18 | 17 | 1 |
| 3 | 16 | 16 | 0 |

Qualitative changes the team noticed:

- Planning time dropped after we capped it at 90 minutes
- CI failures got addressed faster once blockers had an owner
- Demo prep stress went down because we ran `sprint_summary.py` two days early

## Software engineering link

This project is not about inventing a new algorithm. It applies ideas from software process courses: iterative delivery, measurable flow, explicit quality gates, and feedback loops. Those are the same ideas behind professional agile teams in industry, including automotive software groups that ship with pipelines and component tests.

## Impact outside the classroom

Teams that document blockers and retros spend less time re explaining the same problems. That scales to open source, internships, and cross site projects. The scripts here are small on purpose so anyone can read them in one sitting and adapt the json structure.

## What I would do next

- Track cycle time per story in GitHub instead of only story points
- Add a simple stakeholder update email template before each review
- Try a formal Scrum Master coaching session with someone from industry
