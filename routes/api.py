from flask import Blueprint, jsonify, request
from services.data_loader import load_buildings
from services.pathfinding import (nearest_node, dijkstra)

api_bp = Blueprint("api", __name__, url_prefix="/api")

@api_bp.route("/buildings")
def get_buildings():
    buildings = load_buildings()
    return jsonify(buildings)

@api_bp.route("/route", methods=["POST"])
def get_route():
    data = request.get_json()
    building_id = data["building_id"]
    user_lat = data["user_lat"]
    user_lng = data["user_lng"]
    start_node, start_dist = nearest_node(user_lat,user_lng)
    # print("Nearest node:", start_node)
    # print("Distance:", start_dist, "km") 
    destination = building_id
    result = dijkstra(start_node,destination)
    # print(result)
    # print(building_id,user_lat,user_lng)
    return jsonify({
        "status": "ok",
        "result": result
    })