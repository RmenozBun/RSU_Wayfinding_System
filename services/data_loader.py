import json
from config import BUILDINGS_PATH, GRAPH_PATH

def load_buildings() -> list[dict]:
    with open(BUILDINGS_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def load_graph() -> dict:
    with open(GRAPH_PATH, "r", encoding="utf-8") as f:
        return json.load(f)