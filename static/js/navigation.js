export function haversine(lat1, lng1, lat2, lng2) {
    // Distance between latitudes and longitudes
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;

    // Convert to radians
    lat1 = lat1 * Math.PI / 180;
    lat2 = lat2 * Math.PI / 180;

    // Apply Haversine formula
    const a =
        Math.pow(Math.sin(dLat / 2), 2) +
        Math.pow(Math.sin(dLng / 2), 2) *
        Math.cos(lat1) *
        Math.cos(lat2);

    const rad = 6371; // Earth radius (km)
    const c = 2 * Math.asin(Math.sqrt(a));

    return rad * c;
}

export function calculate_distance(userLat, userLng, routePath, currentNodeIndex) {
    let distance = 0;

    // ถึงปลายทางแล้ว
    if (currentNodeIndex >= routePath.length) {
        return 0;
    }

    // ผู้ใช้ -> โหนดเป้าหมายปัจจุบัน
    distance += haversine(
        userLat,
        userLng,
        routePath[currentNodeIndex].lat,
        routePath[currentNodeIndex].lng
    );

    // รวมระยะระหว่างโหนดที่เหลือ
    for (let i = currentNodeIndex; i < routePath.length - 1; i++) {
        distance += haversine(
            routePath[i].lat,
            routePath[i].lng,
            routePath[i + 1].lat,
            routePath[i + 1].lng
        );
    }

    return distance; // km
}

export function bearing(lat1, lng1, lat2, lng2) {
    const dLng = (lng2 - lng1) * Math.PI / 180;
    
    lat1 = lat1 * Math.PI / 180;
    lat2 = lat2 * Math.PI / 180;

    const x = Math.sin(dLng) * Math.cos(lat2);
    const y = Math.cos(lat1) * Math.sin(lat2) - 
              Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

    const angle = Math.atan2(x, y) * 180 / Math.PI;

    // แปลงให้เป็น 0-360 องศา (0 = เหนือ, 90 = ตะวันออก)
    return (angle + 360) % 360;
}