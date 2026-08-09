export async function send_start_data(document,userlat,userlng) {
    const get_building_id = document.getElementById("to-select").value;
    const get_userlat = userlat;
    const get_userlng = userlng;

    const response = await fetch("/api/route", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            building_id: get_building_id,
            user_lat: get_userlat,
            user_lng: get_userlng
        })
    });

    const path = await response.json();
    return path;
}