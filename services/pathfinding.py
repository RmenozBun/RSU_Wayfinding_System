from services.distance import haversine
from services.data_loader import load_graph
from services.node import create_node_lookup
from services.adjacency import build_adjacency

import heapq

graph = load_graph()

node_lookup = create_node_lookup(
    graph["nodes"]
)

adjacency = build_adjacency()

def nearest_node(lat, lng):

    nearest_id = None
    nearest_distance = float("inf")

    for node in graph["nodes"]:
        d = haversine(lat,lng,node["lat"],node["lng"])
        if d < nearest_distance:
            nearest_distance = d
            nearest_id = node["id"]

    return nearest_id, nearest_distance

def dijkstra(start_id, end_id):

    pq = [(0.0, start_id)]
    distances = {
        node: float("inf")
        for node in adjacency
    }
    distances[start_id] = 0.0
    previous = {}
    while pq:
        current_dist, current = heapq.heappop(pq)
        if current == end_id:
            break
        if current_dist > distances[current]:
            continue
        for neighbor, weight in adjacency[current]:
            new_dist = current_dist + weight
            if new_dist < distances[neighbor]:
                distances[neighbor] = new_dist
                previous[neighbor] = current
                heapq.heappush(pq, (new_dist, neighbor))
    if distances[end_id] == float("inf"):
        return [], float("inf")
    # reconstruct path
    path = []
    node = end_id

    while node != start_id:
        path.append(node)
        node = previous[node]
    path.append(start_id)
    path.reverse()
    path_nodes = [
        {
            "id": node_id,
            "lat": node_lookup[node_id]["lat"],
            "lng": node_lookup[node_id]["lng"]
        }
        for node_id in path
    ]
    
    return {"distance_km": distances[end_id],"path": path_nodes}