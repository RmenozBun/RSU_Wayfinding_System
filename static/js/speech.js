export function init_speech(buildings, callback) {
    // เช็ค Browser support
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        alert("⚠️ Browser นี้ไม่รองรับ Web Speech API");
        return null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();

    recognition.lang = "th-TH";
    recognition.continuous = false;
    recognition.interimResults = false;

    // เริ่มฟังเสียง
    recognition.onstart = () => {
        // console.log("🎤 กำลังฟัง...");
    };

    // ได้ข้อความจากเสียง
    recognition.onresult = (event) => {
        const speechText = event.results[0][0].transcript.trim();

        // console.log("ได้ยิน:", speechText);

        // ค้นหาอาคาร
        const building = find_building(speechText,buildings);

        if (building) {
            // console.log("พบอาคาร:", building);
            callback(building);
        } else {
            // console.log("ไม่พบอาคารจากเสียง");
            callback(null);
        }
    };

    recognition.onerror = (event) => {
        // console.error("Speech Error:",event.error);
    };

    recognition.onend = () => {
        // console.log("หยุดฟัง");
    };

    return recognition;
}

function find_building(text, buildings) {
    const keyword = normalizeText(text);

    // console.log("keyword:", keyword);

    return buildings.find(building => {

        return building.alias.some(alias => {

            const aliasText = normalizeText(alias);

            if (!aliasText) {
                return false;
            }

            // อาคารที่มีเลข ต้องตรงกันเท่านั้น
            if (keyword.startsWith("อาคาร") && /\d+$/.test(keyword)) {
                return keyword === aliasText;
            }

            return keyword === aliasText ||
                   keyword.includes(aliasText);
        });
    });
}

function normalizeText(text) {
    return text
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace("สิบเอ็ด", "11")
        .replace("สิบสอง", "12")
        .replace("สิบสี่", "14")
        .replace("หนึ่ง", "1")
        .replace("หก", "6")
        .replace("เจ็ด", "7")
        .replace("เก้า", "9");
}

// ปัญหาที่เจอก่อนหน้านี้คือมี 2 อย่างซ้อนกัน:

// alias ว่าง ""
// ทำให้ includes("") เป็น true
// เลยเจออาคารตัวแรกก่อน
// เลขอาคารซ้อนกัน
// "อาคาร11".includes("อาคาร1") เป็น true
// เลยทำให้อาคาร 1 ชนกับอาคาร 11

// ตอนนี้แก้ด้วย:

// normalize เลขสองหลักก่อนเลขหลักเดียว
// ใช้ exact match เมื่อเป็นชื่ออาคารที่มีตัวเลข