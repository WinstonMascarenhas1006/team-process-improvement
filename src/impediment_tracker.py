"""
CLI to log team blockers during a sprint.
Pick a case study with --case (default is the student team).
"""

import argparse
from datetime import date

from case_cli import add_case_argument, file_key
from storage import load_json, save_json

FILE = file_key("impediments")


def next_id(items):
    if not items:
        return 1
    return max(i.get("id", 0) for i in items) + 1


def cmd_add(args):
    data = load_json(FILE, default={"items": []}, case_id=args.case)
    items = data.get("items", [])
    entry = {
        "id": next_id(items),
        "title": args.title,
        "impact": args.impact or "medium",
        "owner": args.owner or "unassigned",
        "status": "open",
        "opened": date.today().isoformat(),
        "notes": args.notes or "",
    }
    items.append(entry)
    data["items"] = items
    save_json(FILE, data, case_id=args.case)
    print(f"[{args.case}] logged impediment #{entry['id']}: {entry['title']}")


def cmd_list(args):
    data = load_json(FILE, default={"items": []}, case_id=args.case)
    items = data.get("items", [])
    if args.status:
        items = [i for i in items if i.get("status") == args.status]
    if not items:
        print(f"[{args.case}] no impediments in the list")
        return
    for row in items:
        mark = "open" if row.get("status") == "open" else "done"
        print(
            f"#{row['id']} [{mark}] {row.get('title')} "
            f"(owner: {row.get('owner')}, impact: {row.get('impact')})"
        )
        if row.get("notes"):
            print(f"    note: {row['notes']}")


def cmd_resolve(args):
    data = load_json(FILE, default={"items": []}, case_id=args.case)
    items = data.get("items", [])
    found = False
    for row in items:
        if row.get("id") == args.id:
            row["status"] = "resolved"
            row["resolved"] = date.today().isoformat()
            if args.note:
                row["resolution_note"] = args.note
            found = True
            break
    if not found:
        print(f"no impediment with id {args.id}")
        return
    save_json(FILE, data, case_id=args.case)
    print(f"[{args.case}] marked #{args.id} as resolved")


def build_parser():
    parser = argparse.ArgumentParser(description="track sprint blockers")
    add_case_argument(parser)
    sub = parser.add_subparsers(dest="command", required=True)

    add_p = sub.add_parser("add", help="create a new impediment")
    add_p.add_argument("title")
    add_p.add_argument("--owner", help="who is chasing this")
    add_p.add_argument("--impact", choices=["low", "medium", "high"])
    add_p.add_argument("--notes", help="extra context")
    add_p.set_defaults(func=cmd_add)

    list_p = sub.add_parser("list", help="show impediments")
    list_p.add_argument("--status", choices=["open", "resolved"])
    list_p.set_defaults(func=cmd_list)

    resolve_p = sub.add_parser("resolve", help="close an impediment")
    resolve_p.add_argument("id", type=int)
    resolve_p.add_argument("--note", help="how it got fixed")
    resolve_p.set_defaults(func=cmd_resolve)

    return parser


if __name__ == "__main__":
    p = build_parser()
    args = p.parse_args()
    args.func(args)
