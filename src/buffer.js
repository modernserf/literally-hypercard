import { colors } from "./config"

// buffer getter/setters
export function getPixel (buffer, x, y) {
    if (x < 0 || y < 0 || x >= buffer.width || y >= buffer.height) { return colors.transparent }
    return buffer.data[x + y * buffer.width]
}

export function setPixel (buffer, x, y, value) {
    if (x < 0 || y < 0 || x >= buffer.width || y >= buffer.height) { return }
    buffer.data[x + y * buffer.width] = value
}

function uncheckedSetPixel (buffer, x ,y, value) {
    buffer.data[x + y * buffer.width] = value
}

export function getWidth (buffer) {
    return buffer.width
}

export function getHeight (buffer) {
    return buffer.height
}

export function createPattern (arr) {
    const height = arr.length
    const width = arr[0].length
    const logW = fastLog(width)
    const logH = fastLog(height)
    const data = Uint8Array.from(arr.reduce((l, r) => l.concat(r)))
    return { height, width, data, logW, logH }
}

export function createBuffer (width, height) {
    const data = new Uint8Array(height * width)
    const logW = fastLog(width)
    const logH = fastLog(height)
    return { width, height, data, logW, logH }
}

export function copy(buffer) {
    return {
        width: buffer.width,
        height: buffer.height,
        data: buffer.data.slice(0),
        logW: buffer.logW,
        logH: buffer.logH,
    }
}

export function composite (bottom, top) {
    if (!top) { return bottom }
    const out = copy(bottom)
    const offsetX = top.offsetX || 0
    const offsetY = top.offsetY || 0
    for (let y = 0; y < bottom.height; y++) {
        for (let x = 0; x < bottom.width; x++) {
            const t = getPixel(top, x + offsetX, y + offsetY)
            if (t === colors.transparent) {
                // do nothing
            } else if (t === colors.white) {
                uncheckedSetPixel(out, x, y, colors.transparent)
            } else {
                uncheckedSetPixel(out, x, y, t)
            }
        }
    }
    return out
}

export function translate (buffer, p0, p1) {
    buffer.offsetX = p0.x - p1.x
    buffer.offsetY = p0.y - p1.y
    return buffer
}

function fastLog(n) {
    for (let i = 1; i < 10; i++) {
        if ((1 << i) === n) { return i }
    }
    return Math.log2(n) | 0
}

export function setImageData (ctx, buffer, scale, _frame, patterns) {
    const w = getWidth(buffer)
    const h = getHeight(buffer)

    const logW = buffer.logW

    const getFilled = patterns
        ? (px, x, y) => {
            if (!px) { return 0 }
            // all patterns are 4x4
            return getPixel(patterns[px - 1], x & 3, y & 3)
        }
        : (px) => px

    const imageData = ctx.createImageData(w << scale, h << scale)
    const ln = imageData.data.length

    // a / b => a >> log2(b)
    const yScale = 2 + scale + logW + scale
    // a % b => a & b - 1
    const xScale = (1 << logW + scale - 1) - 1

    for (let i = 0; i < ln; i += 4) {
        const y = i >> yScale
        const x = (i >> 2 >> scale) & xScale
        const px = getPixel(buffer, x, y)

        if (getFilled(px, x, y)) {
            imageData.data[i] = 0
            imageData.data[i + 1] = 0
            imageData.data[i + 2] = 0
            imageData.data[i + 3] = 255
        }
    }

    ctx.putImageData(imageData, 0, 0)
}
