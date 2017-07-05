function hex (num) {
    return num.toString(16).padStart(2, "0")
}

export function colorToHex (obj) {
    return `#${hex(obj.r)}${hex(obj.g)}${hex(obj.b)}`
}

export function hexToColor (str) {
    const num = Number(str.replace("#","0x"))
    return {
        r: (num & 0xFF0000) >> 16,
        g: (num & 0x00FF00) >> 8,
        b: (num & 0x0000FF),
    }
}
