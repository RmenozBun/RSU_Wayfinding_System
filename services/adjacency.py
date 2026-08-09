from services.data_loader import load_graph
from services.node import create_node_lookup
from services.distance import haversine

graph = load_graph()

node_lookup = create_node_lookup(
    graph["nodes"]
)

def build_adjacency():
    adjacency = {node["id"]: [] for node in graph["nodes"]}
    for edge in graph["edges"]:
        src = edge["from"]
        dst = edge["to"]

        lat1 = node_lookup[src]["lat"]
        lng1 = node_lookup[src]["lng"]

        lat2 = node_lookup[dst]["lat"]
        lng2 = node_lookup[dst]["lng"]

        distance = haversine(lat1, lng1, lat2, lng2)

        # ถ้า graph เป็นสองทาง
        adjacency[src].append((dst, distance))
        adjacency[dst].append((src, distance))

    return adjacency