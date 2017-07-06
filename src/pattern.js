import { createPattern } from "./buffer"

function tileOffset (tile) {
    const x = tile < 0 ? -tile : 0
    const y = tile > 0 ? tile : 0
    return { x, y }
}

// xFreq / yFreq : 2 4 8
// tile: -7 -- 7
// pixels: 8x8
export function genPattern ({ pixels, xOffset = 0, yOffset = 0, xFreq = 1, yFreq = 1, tile = 0 }) {
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

    return createPattern(out)
}
