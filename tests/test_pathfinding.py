from services.pathfinding import (nearest_node, dijkstra)

# จำลอง GPS ของผู้ใช้
user_lat = 13.968179544171658
user_lng = 100.5867510729241

start_node, start_dist = nearest_node(user_lat,user_lng)

print("Nearest node:", start_node)

# ระยะจากตำแหน่ง GPS ของผู้ใช้ → node ที่ใกล้ที่สุด
print("Distance:", start_dist, "km") 

# สมมุติปลายทาง
destination = "N0700"

result = dijkstra(
    start_node,
    destination
)
print(result)