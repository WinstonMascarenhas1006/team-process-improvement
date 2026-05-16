"""
Sprint report per case study. Industry cases use published metrics in the json bundle.
"""

import argparse

from case_cli import add_case_argument, file_key
from storage import load_case_bundle, load_json

FILE = file_key("sprints")


def cmd_report(args):
    data = load_json(FILE, default={"sprints": []}, case_id=args.case)
    sprints = data.get("sprints", [])
    match = [s for s in sprints if str(s.get("number")) == str(args.number)]
    if not match:
        print(f"[{args.case}] sprint {args.number} not found")
        return
    sprint = match[0]
    print(f"[{args.case}] Sprint {sprint.get('number')} summary")
    print(f"  goal: {sprint.get('goal')}")
    print(f"  planned points: {sprint.get('planned_points')}")
    print(f"  done points: {sprint.get('done_points')}")
    print(f"  stories completed: {sprint.get('stories_done')}")
    print(f"  open impediments at end: {sprint.get('open_impediments')}")
    print(f"  notes: {sprint.get('notes')}")


def cmd_overview(args):
    bundle = load_case_bundle(args.case)
    sprints = bundle.get("sprints", [])
    print(f"Case: {bundle.get('title')}")
    if bundle.get("source_label"):
        print(f"Source: {bundle.get('source_label')}")
    print("")
    if not sprints:
        print("no sprint data")
        return
    print("Sprint overview")
    for s in sprints:
        planned = s.get("planned_points", 0)
        done = s.get("done_points", 0)
        pct = round(100 * done / planned) if planned else 0
        print(
            f"  Sprint {s.get('number')}: {done}/{planned} pts ({pct}%), "
            f"impediments open at end: {s.get('open_impediments')}"
        )


def cmd_kpis(args):
    bundle = load_case_bundle(args.case)
    print(f"KPI snapshot: {bundle.get('title')}")
    for row in bundle.get("kpis", []):
        print(f"  {row.get('label')}: {row.get('before')} -> {row.get('after')} ({row.get('unit', '')})")


def build_parser():
    parser = argparse.ArgumentParser(description="sprint reporting")
    add_case_argument(parser)
    sub = parser.add_subparsers(dest="command", required=True)

    report_p = sub.add_parser("report", help="details for one sprint")
    report_p.add_argument("number")
    report_p.set_defaults(func=cmd_report)

    overview_p = sub.add_parser("overview", help="table of all sprints")
    overview_p.set_defaults(func=cmd_overview)

    kpi_p = sub.add_parser("kpis", help="before and after headline metrics")
    kpi_p.set_defaults(func=cmd_kpis)

    return parser


if __name__ == "__main__":
    p = build_parser()
    args = p.parse_args()
    args.func(args)
