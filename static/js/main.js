import { init_map, add_markers, draw_route } from "./map.js";
import { load_buildings, set_building_selecter } from "./building.js";
import { send_start_data } from "./routepath.js";
import { init_speech } from "./speech.js";
import { haversine, calculate_distance, bearing } from "./navigation.js";
import { get_location, watch_location } from "./geolocation.js";
import { init_orientation, get_device_heading } from "./orientation.js";

let buildings, user_lat, user_lng, m_mark, map, get_path, route_path, dist_path, path_with_user, des_node, building_des_name, recognition, user_mark, des_mark, watchID;
const RSU_CENTER = { lat: 13.966344, lng: 100.585470 };
const RSU_RADIUS_KM = 0.5;

// รอให้ DOM ของ DIV id map สร้างเสร็จแล้วค่อยทำงานข้างใน
document.addEventListener("DOMContentLoaded", () => {
    map = init_map();
});

document.addEventListener("DOMContentLoaded", async () => {
    buildings = await load_buildings();
    await init_start();
    init_voice();
    init_path();
});

async function init_start() {
    set_building_selecter(buildings);
    // console.log(buildings);

    // const position = await get_location();
    // user_lat = position.lat;
    // user_lng = position.lng;

    let position;
    try {
        position = await get_location();
    } catch (err) {
        // GPS ล้มเหลว — แจ้งผู้ใช้แทน
        alert("ไม่สามารถรับตำแหน่ง GPS ได้\nกรุณาเปิดสิทธิ์ Location แล้วรีโหลดหน้า");
        return;
    }

    user_lat = position.lat;
    user_lng = position.lng;

    if (!is_in_rsu(user_lat,user_lng)) {
        document.getElementById("out-of-rsu").classList.remove("hidden");
        return
    }

    user_mark = add_markers(map, user_lat, user_lng, "you're here!", true);
    user_mark.openPopup();
}

async function init_voice() {
    const mic_btn = document.getElementById("mic-btn");

    recognition = init_speech(buildings, (building) => {
        const select = document.getElementById("to-select");
        if (building) {
            // console.log("นำทางไป:", building.name);
            // console.log("ID:", building.id);
            // console.log("ตำแหน่ง:", building.lat, building.lng);
            select.value = building.id;
            select.dispatchEvent(new Event("change"));
        } else { alert("ไม่พบอาคารที่ต้องการ"); }
    });

    mic_btn.addEventListener("click", () => {
        if (recognition) { recognition.start(); }
    });

    if (recognition) {
        recognition.addEventListener("start", () => {
            mic_btn.classList.add("listening");
            mic_btn.textContent = "🔴";
        });

        recognition.addEventListener("end", () => {
            mic_btn.classList.remove("listening");
            mic_btn.textContent = "🎤";
        });

        recognition.addEventListener("error", () => {
            mic_btn.classList.remove("listening");
            mic_btn.textContent = "🎤";
        });
    }
}

async function init_path() {
    document.getElementById("find-route-btn").addEventListener("click", async () => {
        const controls = document.getElementById("controls");
        controls.classList.add("hide");

        get_path = await send_start_data(document, user_lat, user_lng);

        dist_path = get_path.result.distance_km * 1000;
        // console.log(get_path.result.distance_km);
        route_path = get_path.result.path
        path_with_user = [
            {
                id: "user",
                lat: user_lat,
                lng: user_lng
            },
            ...route_path
        ];

        building_des_name = buildings.find(b => b.id === route_path.at(-1).id);
        // console.log(building_des_name);

        user_mark = add_markers(map, user_lat, user_lng, `${dist_path.toFixed()} เมตร`, true);
        user_mark.openPopup();
        des_mark = add_markers(map, building_des_name.lat, building_des_name.lng, building_des_name.name);
        draw_route(map, path_with_user, true);

        await init_orientation();
        await walk_navigate();
    });
}

async function walk_navigate() {
    document.getElementById("direction-arrow").classList.add("visible");

    let current_node_index = 0;
    let last_node_index = 0;
    const ARRIVE_DISTANCE = 0.007; // 7 เมตร
    let walk_path = route_path;
    let walk_dis = 0;
    let navigation_finished = false;

    watchID = watch_location(async (user_location) => {
        // console.log(user_location.lat);
        // ไม่สามารถวาดเส้นนำทางใหม่ทุกการอัปเดตผู้ใช้ได้จะอาการ flicker วาดใหม่ตอนผ่านโหนดนั้นๆ
        const next_node = walk_path[current_node_index];
        const next_next_node = walk_path[current_node_index + 1];

        // เอาไว้นำทางถึงแค่โหนดรองสุดท้าย คือ หน้าอาคาร
        const end_node_index = walk_path.length - 2;

        const dist_to_nextnode = haversine(user_location.lat, user_location.lng, next_node.lat, next_node.lng);

        let dist_to_nextnextnode = Infinity;
        // ถ้าอยู่ node สุดท้าย:next_next_node = undefined

        if (next_next_node) {
            dist_to_nextnextnode = haversine(user_location.lat, user_location.lng, next_next_node.lat, next_next_node.lng);
        }

        // console.log({index: current_node_index,nextNode: next_node.id,distance: dist_to_nextnode * 1000 + " m"});
        if (dist_to_nextnode <= ARRIVE_DISTANCE || (next_next_node && dist_to_nextnextnode + 0.003 < dist_to_nextnode)) {
            // index นี้ไม่ได้หมายถึง "ผู้ใช้ถึงแล้ว" แต่มันหมายถึง "กำลังนำทางไปหา"
            if (current_node_index === end_node_index) {

                // console.log("FINAL LOCATION", user_location);

                // console.log({current_node_index,current_node: walk_path[current_node_index]?.id,dist: dist_to_nextnode * 1000});

                // ทำเพื่อให้หมุดไปปักในตำแหน่งโหนดรองสุดท้ายเมื่อถึงอาคารแล้ว แบบนี้จะตรงหมุดอาคารเมื่อผู้ใช้อยู่ไม่ห่างจากโหนดรอง
                const target = walk_path[current_node_index];
                user_mark.setLatLng([
                    target.lat,
                    target.lng
                ]);

                building_des_name = buildings.find(
                    b => b.id === walk_path.at(-1).id
                );
                user_mark.setPopupContent("ถึงแล้ว " + building_des_name.name);
                user_mark.openPopup();
                draw_route(map, []);

                navigation_finished = true;

                navigator.geolocation.clearWatch(watchID);
                document.getElementById("direction-arrow").classList.remove("visible");

                // จะไปต่อไหม
                setTimeout(() => {
                    const go_again = confirm(`ถึง ${building_des_name.name} แล้ว 🎉\n\nอยากนำทางไปอาคารอื่นต่อไหม?`);
                    if (go_again) {
                        location.reload(); // restart เว็บ location เป็น built-in object ของ browser
                    }
                }, 1000); // รอ 1 วิให้ popup "ถึงแล้ว" แสดงก่อน

                return;
            }
            else {
                current_node_index++;
            }
        }

        // เมื่อถึงหรือเลยโหนดล่าสุด
        if (current_node_index !== last_node_index) {
            const cal_dist_draw_path = [
                {
                    id: "user",
                    lat: user_location.lat,
                    lng: user_location.lng
                },
                ...walk_path.slice(current_node_index)
            ];
            const distance_all_path = calculate_distance(user_location.lat, user_location.lng, walk_path, current_node_index);
            walk_dis = distance_all_path * 1000;
            // user_mark = add_markers(map, user_location.lat, user_location.lng, `${walk_dis.toFixed()} เมตร`, true); walk_dis = 0;
            user_mark.setLatLng([user_location.lat, user_location.lng]);
            user_mark.setPopupContent(`${walk_dis.toFixed()} เมตร`);
            map.setView([user_location.lat, user_location.lng]);
            // user_mark.openPopup();
            draw_route(map, cal_dist_draw_path);
            last_node_index = current_node_index;
        }

        // ตอนปกติเพื่อเอาระยะทางรวมมาแสดง
        if (current_node_index == last_node_index) {
            const distance_path = calculate_distance(user_location.lat, user_location.lng, walk_path, current_node_index)
            walk_dis = distance_path * 1000;
            // user_mark = add_markers(map, user_location.lat, user_location.lng, `${walk_dis.toFixed()} เมตร`, true); walk_dis = 0;
            user_mark.setLatLng([user_location.lat, user_location.lng]);
            user_mark.setPopupContent(`${walk_dis.toFixed()} เมตร`);
            map.setView([user_location.lat, user_location.lng]);
            // user_mark.openPopup();
        }

        // console.log(current_node_index);

        if (navigation_finished) {
            navigator.geolocation.clearWatch(watchID);
            return;
        }

        // update_arrow();
        update_arrow(user_location, walk_path[current_node_index]);
    });
}

function update_arrow(user_location, walk_o_path) {
    // const target = walk_path[current_node_index];
    const target = walk_o_path;
    const target_bearing = bearing(user_location.lat, user_location.lng, walk_o_path.lat, walk_o_path.lng);
    let rotation = target_bearing - get_device_heading;
    rotation = ((rotation + 540) % 360) - 180;
    document.getElementById("direction-arrow").style.transform = `translateX(-50%) rotate(${rotation}deg)`;
}

function is_in_rsu(lat, lng) {
    const dist = haversine(lat, lng, RSU_CENTER.lat, RSU_CENTER.lng);
    return dist <= RSU_RADIUS_KM;
}