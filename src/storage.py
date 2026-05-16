"""
Json helpers. Paths can be global (legacy) or per case study under data/cases/.
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
CASES_DIR = DATA_DIR / "cases"
DEFAULT_CASE = "student-peer-review"


def list_case_ids():
    index = load_json_path(CASES_DIR / "index.json", default={"cases": []})
    return [row["id"] for row in index.get("cases", [])]


def case_bundle_path(case_id: str) -> Path:
    return CASES_DIR / case_id / "case.json"


def load_case_bundle(case_id: str) -> dict:
    path = case_bundle_path(case_id)
    if not path.exists():
        raise FileNotFoundError(f"unknown case: {case_id}")
    return load_json_path(path)


def load_json_path(path: Path, default=None):
    if not path.exists():
        return default if default is not None else {}
    with path.open(encoding="utf-8") as f:
        return json.load(f)


def save_json_path(path: Path, payload) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)
        f.write("\n")


# legacy flat files (still work for the student case scripts if needed)
def data_path(name: str) -> Path:
    return DATA_DIR / name


def load_json(filename: str, default=None, case_id: str | None = None):
    if case_id:
        bundle = load_case_bundle(case_id)
        key = filename.replace(".json", "")
        mapping = {
            "impediments": "impediments",
            "retros": "retros",
            "sprints": "sprints",
        }
        field = mapping.get(key)
        if field == "impediments":
            return {"items": bundle.get("impediments", [])}
        if field == "retros":
            return {"sessions": bundle.get("retros", [])}
        if field == "sprints":
            return {"sprints": bundle.get("sprints", [])}
    return load_json_path(data_path(filename), default=default)


def save_json(filename: str, payload, case_id: str | None = None) -> None:
    if case_id and case_id != DEFAULT_CASE:
        bundle = load_case_bundle(case_id)
        key = filename.replace(".json", "")
        if key == "impediments":
            bundle["impediments"] = payload.get("items", payload)
        elif key == "retros":
            bundle["retros"] = payload.get("sessions", payload)
        elif key == "sprints":
            bundle["sprints"] = payload.get("sprints", payload)
        save_json_path(case_bundle_path(case_id), bundle)
        return
    if case_id == DEFAULT_CASE:
        bundle = load_case_bundle(case_id)
        key = filename.replace(".json", "")
        if key == "impediments":
            bundle["impediments"] = payload.get("items", [])
        elif key == "retros":
            bundle["retros"] = payload.get("sessions", [])
        elif key == "sprints":
            bundle["sprints"] = payload.get("sprints", [])
        save_json_path(case_bundle_path(case_id), bundle)
        return
    save_json_path(data_path(filename), payload)
