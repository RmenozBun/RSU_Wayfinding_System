export async function load_buildings() {
    const response = await fetch("/api/buildings");
    const buildings = await response.json();

    return buildings;
}

export function set_building_selecter(buildings) {
    const select = document.getElementById("to-select");

    // ป้องกันการเพิ่มซ้ำ ถ้าเรียกหลายรอบ
    select.innerHTML = '<option value="">-- เลือกอาคาร --</option>';

    buildings.forEach(building => {
        const option = document.createElement("option");

        option.value = building.id;
        option.textContent = building.name;

        select.appendChild(option);
    });
}