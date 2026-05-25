/**
 * Get the console type
 *
 * @param {number} cType - The console type to set
 * @returns {string} The console type as a string
 */
function getConsoleType(cType) {
    switch (cType & 0xff) {
        case 0x03:
            return "精算機";
        case 0x04:
            return "携帯型端末";
        case 0x05:
            return "等車載端末"; // bus
        case 0x07:
            return "券売機";
        case 0x08:
            return "券売機";
        case 0x09:
            return "入金機(クイックチャージ機)";
        case 0x12:
            return "券売機(東京モノレール)";
        case 0x13:
            return "券売機等";
        case 0x14:
            return "券売機等";
        case 0x15:
            return "券売機等";
        case 0x16:
            return "改札機";
        case 0x17:
            return "簡易改札機";
        case 0x18:
            return "窓口端末";
        case 0x19:
            return "窓口端末(みどりの窓口)";
        case 0x1a:
            return "改札端末";
        case 0x1b:
            return "携帯電話";
        case 0x1c:
            return "乗継清算機";
        case 0x1d:
            return "連絡改札機";
        case 0x1f:
            return "簡易入金機";
        case 0x46:
            return "VIEW ALTTE";
        case 0x48:
            return "VIEW ALTTE";
        case 0xc7:
            return "物販端末"; // sales
        case 0xc8:
            return "自販機"; // sales
        default:
            return "???";
    }
}

/**
 * Get the process type
 *
 * @param {number} proc - The process type to set
 * @returns {string} The process type as a string
 */
function getProcessType(proc) {
    switch (proc & 0xff) {
        case 0x01:
            return "運賃支払(改札出場)";
        case 0x02:
            return "チャージ";
        case 0x03:
            return "券購(磁気券購入)";
        case 0x04:
            return "精算";
        case 0x05:
            return "精算(入場精算)";
        case 0x06:
            return "窓出(改札窓口処理)";
        case 0x07:
            return "新規(新規発行)";
        case 0x08:
            return "控除(窓口控除)";
        case 0x0d:
            return "バス(PiTaPa系)"; // byBus
        case 0x0f:
            return "バス(IruCa系)"; // byBus
        case 0x11:
            return "再発(再発行処理)";
        case 0x13:
            return "支払(新幹線利用)";
        case 0x14:
            return "入A(入場時オートチャージ)";
        case 0x15:
            return "出A(出場時オートチャージ)";
        case 0x1f:
            return "入金(バスチャージ)"; // byBus
        case 0x23:
            return "券購 (バス路面電車企画券購入)"; // byBus
        case 0x46:
            return "物販"; // sales
        case 0x48:
            return "特典(特典チャージ)";
        case 0x49:
            return "入金(レジ入金)"; // sales
        case 0x4a:
            return "物販取消"; // sales
        case 0x4b:
            return "入物 (入場物販)"; // sales
        case 0xc6:
            return "物現 (現金併用物販)"; // sales
        case 0xcb:
            return "入物 (入場現金併用物販)"; // sales
        case 0x84:
            return "精算 (他社精算)";
        case 0x85:
            return "精算 (他社入場精算)";
        default:
            return "???";
    }
}


const stationMap = new Map();

function init(){ 
    $.ajax({
        url: "StationCode.csv",
        dataType: "text",
        success: function(data) {
            var csv = new CSV(data);
            var parsed = csv.parse();
            //console.log(parsed);

            $(parsed).each(function(key, arr) {
                //console.log(arr);
                let value = JSON.parse(JSON.stringify(arr)); ;
                value.splice(0, 3);
                //console.log(arr);
                stationMap.set(padWithZeros(arr[0]).toUpperCase() + "-" + padWithZeros(arr[1]).toUpperCase() + "-" + padWithZeros(arr[2]).toUpperCase(), value);
            });
        },
        error: function(xhr, textStatus, errorThrown) {
            console.error("Error fetching CSV: " + textStatus);
        }
    });

    setTimeout(() => {
        //console.log(inputResult("1D0701140114B6157301000001080300002ED50101000000000000C500"));
        //console.log(inputResult("1D0701140114B6157301000001160100022ED5F10AF1010A000000C400"));
        //console.log(inputResult("1D0701140114B61573010000011601000226C5E70FE719E6000000C2F0"));

    }, 1000);

}






function inputResult(result) {
    // Guard: readCard() returns "" on error/empty slot — return a blank sentinel
    // that insertTable() will silently skip (sequence==0, console=="???", process=="???").
    if (!result || result.length < 58) {  // 13 header + 16 data bytes = 29 bytes = 58 hex chars minimum
        var empty = [];
        empty["console"]  = "???";
        empty["process"]  = "???";
        empty["date"]     = ["0000", "00", "00"];
        empty["balance"]  = 0;
        empty["sequence"] = 0;
        return empty;
    }

    var array = hexStringToArray(result);
    array.splice(0, 13);
    
    console.log(array);

    var ans = [];
    ans["console"] = getConsoleType(Number("0x" + array[0])); // also terminal type
    ans["process"] = getProcessType(Number("0x" + array[1]));

    ans["date"] = hexToBinary(array[4] + array[5]);
    ans["date"][0] = "" + convertTwoDigitYearToFourDigitYear(ans["date"][0]);
    ans["date"][1] = padWithZeros("" + ans["date"][1]);
    ans["date"][2] = padWithZeros("" + ans["date"][2]);


    if(array[0] == "02") {
        // nothing
    }else if(array[0] == "05") {
        // BUS
    }else if(array[0] == "C7" || array[0] == "C8") {

    }else{
        var enterKey = hexToFirstTwoBinaryDigits(array[15]) + "-" + array[6] + "-" + array[7];
        ans["enter"]    = stationMap.get(enterKey);
        ans["enterKey"] = enterKey;
    }
    if(array[0] == "02" || array[0] == "03" || array[0] == "07" || array[0] == "08" || array[0] == "12" || array[0] == "13" || array[0] == "14" || array[0] == "15" || array[0] == "C7" || array[0] == "C8") {
        // nothing
    }else if(array[0] == "12") {
        // BUS
    }else{
        var leaveKey = hexToFirstTwoBinaryDigits(array[15]) + "-" + array[8] + "-" + array[9];
        ans["leave"]    = stationMap.get(leaveKey);
        ans["leaveKey"] = leaveKey;
    }
    ans["balance"] = littleEndianHexToInt(array[10] + array[11]);
    //ans[11] = array[15];
    ans["sequence"] = littleEndianHexToInt(array[13] + array[14]);
    //ans["region"] = hexToFirstTwoBinaryDigits(array[15]);
    return ans;
}


function hexStringToArray(hexString) {
    // Check if the input hexString has an even number of characters
    if (hexString.length % 2 !== 0) {
        throw new Error('Hex string must have an even number of characters');
    }

    // Create an empty array to store the bytes
    const byteArray = [];

    // Loop through the hex string in pairs of two characters
    for (let i = 0; i < hexString.length; i += 2) {
        // Extract two characters from the hex string
        const byteHex = hexString.substr(i, 2);

        // Parse the two characters as a hexadecimal number and push it to the array
        byteArray.push(byteHex);
    }

    return byteArray;
}

function hexToFirstTwoBinaryDigits(hexString) {
// Convert the hexadecimal string to binary
const binaryString = parseInt(hexString, 16).toString(2).padStart(8, "0");

// Extract the first 2 binary digits
const firstTwoBinaryDigits = binaryString.substring(0, 2);

// Convert the first 2 binary digits to an integer
const result = parseInt(firstTwoBinaryDigits, 2);

return  padWithZeros("" + result);
}


function hexToBinary(hexString) {
    // Convert the hex string to a binary string
    const binaryString = parseInt(hexString, 16).toString(2).padStart(hexString.length * 4, '0');
    
    // Split the binary string into three parts
    const binaryParts = [
        binaryString.substr(0, 7),   // First 7 bits
        binaryString.substr(7, 4),   // Next 4 bits
        binaryString.substr(11, 5)   // Last 5 bits
    ];

    // Convert each binary part to an integer
    const integers = binaryParts.map(binaryPart => parseInt(binaryPart, 2));

    return integers;
}

function littleEndianHexToInt(hexString) {
    // Reverse the order of bytes (pairs of 2 characters)
    const reversedHexString = hexString.match(/.{2}/g).reverse().join('');

    // Convert the reversed hex string to an integer
    const intValue = parseInt(reversedHexString, 16);

    return intValue;
}

function padWithZeros(str) {
    return str.padStart(2, '0');
}

/**
 * Get the commuter pass type name from its type code (byte 0 of the 定期券 block).
 *
 * @param {number} typeCode - Raw type byte value
 * @returns {string} Localised pass-type label
 */
function getCommuterPassType(typeCode) {
    switch (typeCode & 0xff) {
        case 0x01: return "通勤定期";
        case 0x02: return "通学定期";
        case 0x03: return "定期券";
        case 0x04: return "定期券";
        default:   return "定期券";
    }
}


/**
 * Decode two consecutive hex-pair bytes as a packed date (7-bit year | 4-bit month | 5-bit day).
 * Returns null if the resulting month or day is out of range.
 *
 * @param {string} hi - High byte hex string (e.g. "34")
 * @param {string} lo - Low byte hex string (e.g. "AC")
 * @returns {string[]|null} [yyyy, mm, dd] zero-padded strings, or null if invalid
 */
function tryDecodeDate(hi, lo) {
    var parts = hexToBinary(hi + lo);
    var month = parts[1], day = parts[2];
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    return [
        "" + convertTwoDigitYearToFourDigitYear(parts[0]),
        padWithZeros("" + month),
        padWithZeros("" + day)
    ];
}

/**
 * Parse a raw commuter-pass (定期券) block returned by readCommuterPass().
 *
 * FeliCa service 0x108F — confirmed byte layout after removing the 13-byte header:
 *   [0]      定期種別 (0x00 = empty slot / no pass)
 *   [1]      flags / 区間種別
 *   [2]      入場駅 線区コード  from-station line code
 *             (area = top 2 bits of this byte, same encoding used in transit-history)
 *   [3]      入場駅 駅順コード  from-station station code
 *   [4-5]    不明 / possibly validity start date (7+4+5-bit packed)
 *   [6-7]    最終利用日 last-used date (written by turnstile on each tap)
 *   [8-9]    有効開始日 validity start date (7+4+5-bit packed) — tried first
 *   [10-11]  有効終了日 validity end date   (7+4+5-bit packed) — tried first
 *   [12-13]  不明
 *   [14]     出場駅 線区コード  to-station line code
 *   [15]     出場駅 駅順コード  to-station station code
 *
 * @param {string} result - Raw hex response string from readCommuterPass()
 * @returns {Object|null} Parsed pass object, or null if the slot is empty / invalid
 */
function parseCommuterPass(result) {
    if (!result || result.length < 58) return null;  // 13 header + 16 data = 29 bytes = 58 hex chars

    var array = hexStringToArray(result);
    array.splice(0, 13);  // Remove FeliCa response header (same as inputResult)

    // === Debug: print all 16 raw bytes so byte-layout issues can be diagnosed ===
    console.log('[定期券 raw] ' + array.map((b, i) => '[' + i + ']' + b).join(' '));

    // Byte 0 == 0x00 → empty slot
    var passTypeByte = parseInt("0x" + array[0]);
    if (passTypeByte === 0) return null;

    var pass = {};
    pass["typeName"] = getCommuterPassType(passTypeByte);

    // --- Station lookup ---
    // The area is encoded in the top 2 bits of the line-code byte itself
    // (same numeric value as the area derived from byte [15] in history blocks).
    var fromArea = hexToFirstTwoBinaryDigits(array[2]);
    var fromKey  = fromArea + "-" + array[2] + "-" + array[3];

    var toArea   = hexToFirstTwoBinaryDigits(array[14]);
    var toKey    = toArea   + "-" + array[14] + "-" + array[15];

    pass["from"]    = stationMap.get(fromKey);
    pass["to"]      = stationMap.get(toKey);
    pass["fromRaw"] = fromKey;
    pass["toRaw"]   = toKey;
    pass["fromKey"] = fromKey;
    pass["toKey"]   = toKey;

    // --- Last-used date: bytes [6-7] ---
    pass["lastUsed"] = tryDecodeDate(array[6], array[7]);

    // --- Validity dates ---
    // Primary guess: [8-9] = start, [10-11] = end.
    // Fallback:      [4-5] = start, [8-9]   = end.
    var startDate = tryDecodeDate(array[8],  array[9]);
    var endDate   = tryDecodeDate(array[10], array[11]);
    if (!startDate || !endDate) {
        startDate = tryDecodeDate(array[4], array[5]);
        endDate   = tryDecodeDate(array[8], array[9]);
    }
    pass["startDate"] = startDate || null;
    pass["endDate"]   = endDate   || null;

    return pass;
}


function convertTwoDigitYearToFourDigitYear(twoDigitYear) {
    // Determine the threshold for deciding the century
    const currentYear = new Date().getFullYear();
    const centuryThreshold = currentYear % 100 + 2; // Adjust as needed

    // Convert the 2-digit year to a 4-digit year based on the threshold
    if (twoDigitYear < centuryThreshold) {
        return 2000 + twoDigitYear;
    } else {
        return 1900 + twoDigitYear;
    }
}