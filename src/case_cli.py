"""Shared argparse bit so every script knows which case study is active."""

import argparse

from storage import DEFAULT_CASE, list_case_ids


def add_case_argument(parser: argparse.ArgumentParser) -> None:
    ids = list_case_ids()
    parser.add_argument(
        "--case",
        default=DEFAULT_CASE,
        choices=ids,
        help=f"case study id (default: {DEFAULT_CASE})",
    )


def file_key(name: str) -> str:
    return f"{name}.json"
