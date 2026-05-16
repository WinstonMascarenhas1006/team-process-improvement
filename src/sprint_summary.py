"""
Print a one page sprint report from json files.
Handy before a review meeting so you do not scramble for numbers.
"""

import argparse

from storage import load_json

FILE = "sprints.json"


def cmd_report(args):
    data = load_json(FILE, default={"sprints": []})
    sprints = data.get("sprints", [])
    match = [s for s in sprints if str(s.get("number")) == str(args.number)]
    if not match:
        print(f"sprint {args.number} not found in {FILE}")
        return
    sprint = match[0]
    print(f"Sprint {sprint.get('number')} summary")
    print(f"  goal: {sprint.get('goal')}")
    print(f"  planned points: {sprint.get('planned_points')}")
    print(f"  done points: {sprint.get('done_points')}")
    print(f"  stories completed: {sprint.get('stories_done')}")
    print(f"  open impediments at end: {sprint.get('open_impediments')}")
    print(f"  notes: {sprint.get('notes')}")


def cmd_overview(_args):
    data = load_json(FILE, default={"sprints": []})
    sprints = data.get("sprints", [])
    if not sprints:
        print("no sprint data")
        return
    print("Sprint overview")
    for s in sprints:
        planned = s.get("planned_points", 0)
        done = s.get("done_points", 0)
        pct = 0
        if planned:
            pct = round(100 * done / planned)
        print(
            f"  Sprint {s.get('number')}: {done}/{planned} pts ({pct}%), "
            f"impediments open at end: {s.get('open_impediments')}"
        )


def build_parser():
    parser = argparse.ArgumentParser(description="sprint reporting")
    sub = parser.add_subparsers(dest="command", required=True)

    report_p = sub.add_parser("report", help="details for one sprint")
    report_p.add_argument("number")
    report_p.set_defaults(func=cmd_report)

    overview_p = sub.add_parser("overview", help="table of all sprints")
    overview_p.set_defaults(func=cmd_overview)

    return parser


if __name__ == "__main__":
    p = build_parser()
    args = p.parse_args()
    args.func(args)
