// export async function get_location() {
    //     if (!navigator.geolocation) {
        //         alert("Browser นี้ไม่รองรับ GPS");
        //         return null;
        //     }
        //     return new Promise((resolve, reject) => {
            //         navigator.geolocation.getCurrentPosition(
                //             (pos) => resolve({
                    //                 lat: pos.coords.latitude,
                    //                 lng: pos.coords.longitude
                    //             }),
                    //             reject,
                    //             { enableHighAccuracy: true }
                    //         );
                    //     });
                    // }
                    
// start เอาตำแหน่งผู้ใช้ครั้งเดียวเพื่อเอาไป set up navigate เพิ่ม timeout: 10000 (10 วินาที) ถ้าไม่มี timeout GPS จะรอไม่มีกำหนด แล้วผู้ใช้ไม่รู้ว่าเกิดอะไรขึ้น
export function get_location() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Browser ไม่รองรับ GPS"));
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => resolve({
                lat: pos.coords.latitude,
                lng: pos.coords.longitude
            }),
            (err) => reject(err),
            { enableHighAccuracy: true, timeout: 10000 }
        );
    });
}

// ใช้รับตำแหน่งผู้ใช้เรื่อยๆเพื่อนำทางเดิน
export async function watch_location(callback) {
    const watchId = navigator.geolocation.watchPosition(
        (pos) => callback({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
        }),
        (err) => {
            // code 2 = ตำแหน่งไม่พร้อมชั่วคราว ไม่ต้อง alert ให้ข้ามไปก่อน
            if (err.code === 2) return;
            // console.error("GPS error:", err);
        },
        { enableHighAccuracy: true }
    );
    return watchId; // เก็บไว้ใช้ clearWatch() ตอนถึงปลายทาง
}