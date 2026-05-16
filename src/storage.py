"""
Small helpers for reading and writing json in the data folder.
Nothing fancy, just avoids copy pasting the same open() calls everywhere.
"""

import json
from pathlib import Path

# repo root is one level up from src/
ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"


def data_path(name: str) -> Path:
    return DATA_DIR / name


def load_json(filename: str, default=None):
    path = data_path(filename)
    if not path.exists():
        return default if default is not None else {}
    with path.open(encoding="utf-8") as f:
        return json.load(f)


def save_json(filename: str, payload) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    path = data_path(filename)
    with path.open("w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)
        f.write("\n")
