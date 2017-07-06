import { createBuffer, createPattern as createPatternBuffer, setPixel, getPixel } from "./buffer"

function tileOffset (tile) {
    const x = tile < 0 ? -tile : 0
    const y = tile > 0 ? tile : 0
    return { x, y }
}

// xFreq / yFreq : 2 4 8
// tile: -7 -- 7
// pixels: 8x8
export function createPattern ({ pixels, xOffset = 0, yOffset = 0, xFreq = 1, yFreq = 1, tile = 0 }) {
    const t = tileOffset(tile)

    const out = new Array(8).fill(0).map(() => [])

    for (let yBlock = 0; yBlock < (8 / yFreq); yBlock++) {
        for (let y = 0; y < yFreq; y++) {
            for (let xBlock = 0; xBlock < (8 / xFreq); xBlock++) {
                for (let x = 0; x < xFreq; x++) {
                    out[
                        (y + (yBlock * yFreq) + (t.y * xBlock) + yOffset) & 7
                    ][
                        (x + (xBlock * xFreq) + (t.x * yBlock) + xOffset) & 7
                    ] = (pixels[y] && pixels[y][x]) || 0
                }
            }
        }
    }

    return createPatternBuffer(out)
}

export function rotateLeft (arr) {
    const out = []
    for (let y = 0; y < arr.length; y++) {
        out.push(arr.map((row) => row[y]))
    }
    return out.reverse()
}

export function rotateRight (arr) {
    const out = []
    for (let y = 0; y < arr.length; y++) {
        out.push(arr.map((row) => row[y]).reverse())
    }
    return out
}

export function flipHorizontal (arr) {
    const out = []
    for (let y = 0; y < arr.length; y++) {
        out.push(arr[y].slice(0).reverse())
    }
    return out
}

export function flipVertical (arr) {
    return arr.slice(0).reverse()
}

export function invert (arr) {
    return arr.map((row) => row.map((x) => x ^ 1))
}

export function togglePixel (arr, point) {
    const out = arr.map((r) => r.slice(0))
    out[point.y][point.x] ^= 1
    return out
}

// TODO
export function fillPattern (pattern, width, height) {
    const basePattern = createPattern(pattern)
    const buf = createBuffer(width, height)
    for (let y = 0; y < width; y++) {
        for (let x = 0; x < height; x++) {
            setPixel(buf, x, y, getPixel(basePattern, x & 7, y & 7))
        }
    }
    return buf
}
