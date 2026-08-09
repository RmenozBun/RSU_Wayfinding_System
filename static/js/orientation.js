// ขอ Permission (จำเป็นสำหรับ ios)

export let get_device_heading = 0;

export async function init_orientation() {
    if (
        typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission === "function"
    ) {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission === "granted") {
            get_orientation();
        } else {
            alert("ไม่ได้รับสิทธิ์ใช้งานเข็มทิศ");
        }
    } else {
        // Android
        get_orientation();
    }
}

function get_orientation() {
    window.addEventListener("deviceorientationabsolute", (event) => {
        // iPhone
        if (event.webkitCompassHeading !== undefined) {
            get_device_heading = event.webkitCompassHeading;
        }
        // Android
        else if (event.alpha !== null) {
            get_device_heading = (360 - event.alpha) % 360;
        }
    },true);
}