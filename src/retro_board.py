"""
Capture retro notes. Use --case to view industry examples or your own team data.
"""

import argparse
from datetime import date

from case_cli import add_case_argument, file_key
from storage import load_json, save_json

FILE = file_key("retros")


def cmd_add(args):
    data = load_json(FILE, default={"sessions": []}, case_id=args.case)
    sessions = data.get("sessions", [])
    session = {
        "sprint": args.sprint,
        "date": date.today().isoformat(),
        "mad": args.mad or [],
        "sad": args.sad or [],
        "glad": args.glad or [],
        "action": args.action,
    }
    for key in ("mad", "sad", "glad"):
        val = session[key]
        if len(val) == 1 and "," in val[0]:
            session[key] = [bit.strip() for bit in val[0].split(",") if bit.strip()]
    sessions.append(session)
    data["sessions"] = sessions
    save_json(FILE, data, case_id=args.case)
    print(f"[{args.case}] saved retro for sprint {args.sprint}")


def cmd_list(args):
    data = load_json(FILE, default={"sessions": []}, case_id=args.case)
    sessions = data.get("sessions", [])
    if not sessions:
        print(f"[{args.case}] no retros yet")
        return
    for s in sessions:
        print(f"\n[{args.case}] Sprint {s.get('sprint')} ({s.get('date')})")
        print(f"  action: {s.get('action')}")
        for bucket in ("glad", "sad", "mad"):
            items = s.get(bucket) or []
            if items:
                print(f"  {bucket}:")
                for line in items:
                    print(f"    * {line}")


def build_parser():
    parser = argparse.ArgumentParser(description="retro notes")
    add_case_argument(parser)
    sub = parser.add_subparsers(dest="command", required=True)

    add_p = sub.add_parser("add")
    add_p.add_argument("sprint", help="sprint number or label")
    add_p.add_argument("--mad", nargs="*", help="what annoyed us")
    add_p.add_argument("--sad", nargs="*", help="what slowed us down")
    add_p.add_argument("--glad", nargs="*", help="what went well")
    add_p.add_argument("--action", required=True, help="one change for next sprint")
    add_p.set_defaults(func=cmd_add)

    list_p = sub.add_parser("list")
    list_p.set_defaults(func=cmd_list)

    return parser


if __name__ == "__main__":
    p = build_parser()
    args = p.parse_args()
    args.func(args)
