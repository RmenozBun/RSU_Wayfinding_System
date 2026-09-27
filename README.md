# RSU Wayfinding System

A campus wayfinding (indoor/outdoor walking-navigation) web app for **Rangsit University (RSU)**, built with a Flask backend and an interactive Leaflet map on the frontend. Users allow browser geolocation, pick (or say out loud) a destination building, and the app computes the shortest walking route on a pre-defined footpath graph using Dijkstra's algorithm, then guides them there turn-by-turn with a live rotating direction arrow, a compass heading (device orientation), and real-time distance updates as they walk.

## Features

- **Interactive campus map** rendered with [Leaflet.js](https://leafletjs.com/), centered on the RSU campus, using Google Maps tiles.
- **Building selector** populated dynamically from a `/api/buildings` endpoint, listing all mapped campus buildings.
- **Voice search** for destinations via the Web Speech API (`webkitSpeechRecognition`/`SpeechRecognition`), matching spoken Thai building names/aliases (e.g. "อาคารหนึ่ง", "อาคารอาทิตย์") to a building, including Thai number-word normalization (e.g. "สิบเอ็ด" → "11").
- **Shortest-path routing** on a node/edge campus footpath graph (`data/graph.json`) using Dijkstra's algorithm with Haversine great-circle distances as edge weights, exposed via a `POST /api/route` endpoint.
- **Live GPS navigation**: watches the user's position (`navigator.geolocation.watchPosition`) and redraws the remaining route as the user walks, advancing to the next path node automatically.
- **Direction arrow with compass heading**: uses `DeviceOrientationEvent` (with iOS permission handling) to rotate an on-screen arrow toward the next waypoint relative to where the phone is facing.
- **Real-time distance readout**: recalculates remaining distance (in meters) to the destination as the user's GPS position updates.
- **Geofencing**: if the user's location is outside a ~500 m radius of the campus center, an "out of RSU area" overlay is shown instead of the map.
- **Arrival detection**: automatically detects when the user has reached the final building node, shows an arrival popup, and offers to restart navigation to a new destination.

## Tech Stack

- **Backend**: Python 3.11, [Flask](https://flask.palletsprojects.com/) (Blueprints for views/API routes), [Gunicorn](https://gunicorn.org/) (production WSGI server)
- **Routing/graph algorithm**: Custom Dijkstra's shortest-path implementation over a JSON node/edge graph, with Haversine distance calculations (pure Python, `heapq`-based priority queue)
- **Data storage**: Static JSON files (`data/buildings.json`, `data/graph.json`) — no database
- **Frontend**: Vanilla JavaScript (ES Modules, no framework/bundler), [Leaflet.js](https://leafletjs.com/) for the map, Google Maps tile layer
- **Browser APIs**: Geolocation API, Web Speech API (voice recognition), Device Orientation API (compass)
- **Testing**: A manual/script-style test (`tests/test_pathfinding.py`) exercising the pathfinding service

## Getting Started

### Prerequisites

- Python 3.11 (see `.python-version`)
- pip

### Installation

```bash
git clone https://github.com/RmenozBun/RSU_Wayfinding_System.git
cd RSU_Wayfinding_System
python -m venv venv
source venv/bin/activate   # on Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Running locally

Development mode (Flask's built-in server):

```bash
python app.py
```

The app will start (Flask's default local address/port) and serve the wayfinding UI at `/`.

Production-style run (using Gunicorn, as listed in `requirements.txt`):

```bash
gunicorn app:app
```

Then open the app in a **mobile browser** (or a desktop browser with location spoofed to campus coordinates) — geolocation, compass, and voice search work best on a phone. Note that navigation features rely on being physically near/within the RSU campus, since the app geofences to a ~500 m radius around campus and will otherwise show an "outside RSU" message.

### API Endpoints

- `GET /api/buildings` — returns the list of campus buildings (id, name, aliases, coordinates).
- `POST /api/route` — body: `{ "building_id": "<id>", "user_lat": <float>, "user_lng": <float> }`; returns the shortest walking path (list of nodes) and total distance in km.

## Project Structure

```
.
├── app.py                  # Flask app factory / entry point
├── config.py                # Paths to data files
├── data/
│   ├── buildings.json        # Campus building metadata (name, aliases, coordinates)
│   └── graph.json             # Footpath graph (nodes + edges) used for routing
├── routes/
│   ├── views.py               # Page routes (renders index.html)
│   └── api.py                  # JSON API routes (/api/buildings, /api/route)
├── services/
│   ├── data_loader.py          # Loads buildings/graph JSON
│   ├── node.py                  # Node lookup helper
│   ├── adjacency.py              # Builds the routing graph's adjacency list
│   ├── distance.py                # Haversine distance calculation
│   └── pathfinding.py              # Nearest-node lookup + Dijkstra's algorithm
├── static/
│   ├── css/style.css            # App styling
│   └── js/                       # ES module frontend logic (map, navigation, voice, GPS, compass, etc.)
├── templates/
│   ├── base.html                 # Base HTML layout
│   └── index.html                 # Main page (map + controls)
└── tests/
    └── test_pathfinding.py         # Script exercising nearest_node() and dijkstra()
```

## Author

**Theeranat Aiyarakhom**
GitHub: [https://github.com/RmenozBun](https://github.com/RmenozBun)

---

# ระบบนำทางภายในมหาวิทยาลัยรังสิต (RSU Wayfinding System)

## ภาษาไทย

เว็บแอปพลิเคชันนำทางเดินเท้าภายในมหาวิทยาลัยรังสิต พัฒนาด้วย Flask เป็นแบ็กเอนด์ และแผนที่แบบอินเทอร์แอกทีฟด้วย Leaflet เป็นฟรอนต์เอนด์ ผู้ใช้อนุญาตให้เว็บเข้าถึงตำแหน่ง GPS จากนั้นเลือก (หรือพูด) ชื่ออาคารปลายทาง ระบบจะคำนวณเส้นทางเดินที่สั้นที่สุดบนกราฟเส้นทางเดินเท้าที่กำหนดไว้ล่วงหน้า โดยใช้อัลกอริทึม Dijkstra แล้วนำทางผู้ใช้แบบทีละขั้นตอนด้วยลูกศรบอกทิศทางที่หมุนตามเข็มทิศของอุปกรณ์ พร้อมอัปเดตระยะทางแบบเรียลไทม์ขณะเดิน

### ฟีเจอร์

- **แผนที่มหาวิทยาลัยแบบอินเทอร์แอกทีฟ** แสดงผลด้วย [Leaflet.js](https://leafletjs.com/) โดยตั้งศูนย์กลางไว้ที่มหาวิทยาลัยรังสิต ใช้ tile จาก Google Maps
- **เมนูเลือกอาคารปลายทาง** ดึงข้อมูลแบบไดนามิกจาก endpoint `/api/buildings` แสดงรายชื่ออาคารทั้งหมดในแผนที่
- **ค้นหาด้วยเสียง** ผ่าน Web Speech API (`webkitSpeechRecognition`/`SpeechRecognition`) รองรับการจับคู่ชื่ออาคาร/คำเรียกอื่น ๆ ภาษาไทย (เช่น "อาคารหนึ่ง", "อาคารอาทิตย์") รวมถึงการแปลงตัวเลขภาษาไทยเป็นตัวเลข (เช่น "สิบเอ็ด" → "11")
- **การหาเส้นทางที่สั้นที่สุด** บนกราฟเส้นทางเดินเท้าของมหาวิทยาลัย (`data/graph.json`) ด้วยอัลกอริทึม Dijkstra โดยใช้ระยะทาง Haversine เป็นน้ำหนักของเส้นเชื่อม เปิดให้เรียกใช้ผ่าน endpoint `POST /api/route`
- **การนำทางแบบเรียลไทม์ด้วย GPS** ติดตามตำแหน่งผู้ใช้ (`navigator.geolocation.watchPosition`) และวาดเส้นทางที่เหลือใหม่ขณะเดิน พร้อมเลื่อนไปยังจุดถัดไปของเส้นทางโดยอัตโนมัติ
- **ลูกศรบอกทิศทางพร้อมเข็มทิศ** ใช้ `DeviceOrientationEvent` (รองรับการขอสิทธิ์บน iOS) เพื่อหมุนลูกศรบนหน้าจอให้ชี้ไปยังจุดถัดไปตามทิศทางที่โทรศัพท์หันอยู่
- **แสดงระยะทางแบบเรียลไทม์** คำนวณระยะทางที่เหลือ (หน่วยเมตร) ไปยังปลายทางใหม่ทุกครั้งที่ตำแหน่ง GPS อัปเดต
- **ตรวจสอบขอบเขตพื้นที่ (Geofencing)** หากผู้ใช้อยู่นอกรัศมีประมาณ 500 เมตรจากศูนย์กลางมหาวิทยาลัย ระบบจะแสดงข้อความว่าอยู่นอกพื้นที่แทนแผนที่
- **ตรวจจับการถึงปลายทาง** ระบบจะตรวจพบโดยอัตโนมัติเมื่อผู้ใช้เดินถึงอาคารปลายทาง แสดงข้อความแจ้งเตือน และถามว่าต้องการนำทางไปอาคารอื่นต่อหรือไม่

### เทคโนโลยีที่ใช้

- **แบ็กเอนด์**: Python 3.11, [Flask](https://flask.palletsprojects.com/) (ใช้ Blueprint แยกส่วน views/API), [Gunicorn](https://gunicorn.org/) (สำหรับรันบน production)
- **อัลกอริทึมหาเส้นทาง**: Dijkstra's algorithm ที่เขียนขึ้นเอง ทำงานบนกราฟ node/edge แบบ JSON โดยคำนวณระยะทางด้วยสูตร Haversine (Python ล้วน ใช้ `heapq` เป็น priority queue)
- **การจัดเก็บข้อมูล**: ไฟล์ JSON แบบ static (`data/buildings.json`, `data/graph.json`) ไม่มีฐานข้อมูล
- **ฟรอนต์เอนด์**: JavaScript ล้วน (ES Modules ไม่ใช้เฟรมเวิร์กหรือ bundler), [Leaflet.js](https://leafletjs.com/) สำหรับแผนที่, Google Maps tile layer
- **Browser API ที่ใช้**: Geolocation API, Web Speech API (จดจำเสียงพูด), Device Orientation API (เข็มทิศ)
- **การทดสอบ**: สคริปต์ทดสอบ (`tests/test_pathfinding.py`) สำหรับตรวจสอบการทำงานของฟังก์ชันหาเส้นทาง

### เริ่มต้นใช้งาน

#### สิ่งที่ต้องมีก่อน

- Python 3.11 (ดูไฟล์ `.python-version`)
- pip

#### การติดตั้ง

```bash
git clone https://github.com/RmenozBun/RSU_Wayfinding_System.git
cd RSU_Wayfinding_System
python -m venv venv
source venv/bin/activate   # บน Windows ใช้: venv\Scripts\activate
pip install -r requirements.txt
```

#### การรันเว็บแอป

โหมดพัฒนา (ใช้เซิร์ฟเวอร์ในตัวของ Flask):

```bash
python app.py
```

เว็บแอปจะเริ่มทำงานและให้บริการหน้าเว็บนำทางที่ path `/`

การรันแบบ production (ด้วย Gunicorn ตามที่ระบุใน `requirements.txt`):

```bash
gunicorn app:app
```

จากนั้นเปิดเว็บแอปผ่าน **เบราว์เซอร์บนมือถือ** (หรือเบราว์เซอร์บนเดสก์ท็อปที่ปลอมตำแหน่ง GPS ให้ตรงกับพิกัดมหาวิทยาลัย) เนื่องจากฟีเจอร์ระบุตำแหน่ง เข็มทิศ และค้นหาด้วยเสียง จะทำงานได้ดีที่สุดบนมือถือ และระบบจะทำงานได้เมื่ออยู่ในบริเวณใกล้เคียงหรือภายในมหาวิทยาลัยรังสิตเท่านั้น (มีการตรวจสอบขอบเขตพื้นที่ในรัศมีประมาณ 500 เมตรจากศูนย์กลางมหาวิทยาลัย)

#### API Endpoints

- `GET /api/buildings` — คืนค่ารายชื่ออาคารทั้งหมดในมหาวิทยาลัย (id, ชื่อ, ชื่อเรียกอื่น, พิกัด)
- `POST /api/route` — ส่ง body: `{ "building_id": "<id>", "user_lat": <float>, "user_lng": <float> }`; คืนค่าเส้นทางเดินที่สั้นที่สุด (รายการโหนด) และระยะทางรวมเป็นกิโลเมตร

### โครงสร้างโปรเจกต์

```
.
├── app.py                  # จุดเริ่มต้นของแอป Flask
├── config.py                # กำหนด path ของไฟล์ข้อมูล
├── data/
│   ├── buildings.json        # ข้อมูลอาคาร (ชื่อ, ชื่อเรียกอื่น, พิกัด)
│   └── graph.json             # กราฟเส้นทางเดินเท้าที่ใช้ในการหาเส้นทาง
├── routes/
│   ├── views.py               # เส้นทางสำหรับแสดงหน้าเว็บ (index.html)
│   └── api.py                  # เส้นทาง API แบบ JSON (/api/buildings, /api/route)
├── services/
│   ├── data_loader.py          # โหลดข้อมูลอาคาร/กราฟจาก JSON
│   ├── node.py                  # ฟังก์ชันช่วยค้นหาโหนด
│   ├── adjacency.py              # สร้าง adjacency list ของกราฟเส้นทาง
│   ├── distance.py                # คำนวณระยะทางด้วยสูตร Haversine
│   └── pathfinding.py              # ค้นหาโหนดที่ใกล้ที่สุด + อัลกอริทึม Dijkstra
├── static/
│   ├── css/style.css            # การจัดสไตล์ของเว็บแอป
│   └── js/                       # โค้ด ES module ฝั่งฟรอนต์เอนด์ (แผนที่, นำทาง, เสียง, GPS, เข็มทิศ ฯลฯ)
├── templates/
│   ├── base.html                 # เลย์เอาต์ HTML หลัก
│   └── index.html                 # หน้าเว็บหลัก (แผนที่ + ปุ่มควบคุม)
└── tests/
    └── test_pathfinding.py         # สคริปต์ทดสอบฟังก์ชัน nearest_node() และ dijkstra()
```

### ผู้พัฒนา

**ธีรนาถ อัยราคม (Theeranat Aiyarakhom)**
GitHub: [https://github.com/RmenozBun](https://github.com/RmenozBun)
