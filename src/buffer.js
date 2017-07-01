import { colors, width, height } from "./config"

// buffer getter/setters
export function getPixel (buffer, x, y) {
    if (x < 0 || y < 0 || x >= width || y >= height) { return colors.transparent }
    return buffer[y][x]
}

export function setPixel (buffer, x, y, value) {
    if (x < 0 || y < 0 || x >= width || y >= height) { return }
    buffer[y][x] = value
}

export function getWidth (buffer) {
    return buffer[0].length
}

export function getHeight (buffer) {
    return buffer.length
}

export function createBuffer (width, height) {
    return Array(height).fill(0).map(() =>
        Array(width).fill(colors.transparent))
}

export function composite (bottom, top) {
    if (!top) { return bottom }
    const out = []
    for (let y = 0; y < height; y++) {
        const line = []
        for (let x = 0; x < width; x++) {
            const t = getPixel(top, x, y)
            if (t === colors.transparent) {
                line.push(getPixel(bottom, x, y))
            } else if (t === colors.erase) {
                line.push(colors.transparent)
            } else {
                line.push(t)
            }
        }
        out.push(line)
    }
    return out
}

export function setImageData (ctx, buffer, scale) {
    const w = getWidth(buffer)
    const h = getHeight(buffer)

    ctx.fillStyle = "#000"

    const imageData = ctx.createImageData(w << scale, h << scale)
    const ln = imageData.data.length
    for (let i = 0; i < ln; i += 4) {
        const y = (i >> (2 + scale)) / (w << scale)
        const x = (i >> (2 + scale)) % (w << scale - 1)
        const px = getPixel(buffer, x, y | 0)
        let r = 0, g = 0, b = 0, a = 0
        if (px === colors.black) {
            r = 0
            g = 0
            b = 0
            a = 255
        } else if (px === colors.white) {
            r = 255
            g = 255
            b = 255
            a = 255
        }

        imageData.data[i] = r
        imageData.data[i + 1] = g
        imageData.data[i + 2] = b
        imageData.data[i + 3] = a
    }

    ctx.putImageData(imageData, 0, 0)
}
