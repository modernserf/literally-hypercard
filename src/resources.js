import { createPattern } from "./buffer"

const X = 1
const _ = 0

export const brushes = [
    [
        [X],
    ],
    [
        [X,X],
        [X,X],
    ],
    [
        [X,X,X,X],
        [X,X,X,X],
        [X,X,X,X],
        [X,X,X,X],
    ],
    [
        [_,X,X,_],
        [X,X,X,X],
        [X,X,X,X],
        [_,X,X,_]
    ],
    [
        [X,X,X,X,X,X,X,X],
        [X,X,X,X,X,X,X,X],
        [X,X,X,X,X,X,X,X],
        [X,X,X,X,X,X,X,X],
        [X,X,X,X,X,X,X,X],
        [X,X,X,X,X,X,X,X],
        [X,X,X,X,X,X,X,X],
        [X,X,X,X,X,X,X,X],
    ],
    [
        [_,_,_,X,X,_,_,_],
        [_,X,X,X,X,X,X,_],
        [_,X,X,X,X,X,X,_],
        [X,X,X,X,X,X,X,X],
        [X,X,X,X,X,X,X,X],
        [_,X,X,X,X,X,X,_],
        [_,X,X,X,X,X,X,_],
        [_,_,_,X,X,_,_,_],
    ],
    [
        [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
        [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
        [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
        [_,_,_,_,_,_,_,X,X,X,_,_,_,_,_,_],
        [_,_,_,_,_,X,X,X,X,X,X,X,_,_,_,_],
        [_,_,_,_,X,X,X,X,X,X,X,X,X,_,_,_],
        [_,_,_,_,X,X,X,X,X,X,X,X,X,_,_,_],
        [_,_,_,X,X,X,X,X,X,X,X,X,X,X,_,_],
        [_,_,_,X,X,X,X,X,X,X,X,X,X,X,_,_],
        [_,_,_,X,X,X,X,X,X,X,X,X,X,X,_,_],
        [_,_,_,_,X,X,X,X,X,X,X,X,X,_,_,_],
        [_,_,_,_,X,X,X,X,X,X,X,X,X,_,_,_],
        [_,_,_,_,_,X,X,X,X,X,X,X,_,_,_,_],
        [_,_,_,_,_,_,_,X,X,X,_,_,_,_,_,_],
        [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
        [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
    ],
].map(createPattern)


function tileOffset (tile) {
    const x = tile < 0 ? -tile : 0
    const y = tile > 0 ? tile : 0
    return { x, y }
}

// xFreq / yFreq : 2 4 8
// tile: -7 -- 7
// pixels: 8x8
function genPattern (pixels, { xFreq = 1, yFreq = 1, tile = 0 } = {}) {
    const t = tileOffset(tile)

    const out = new Array(8).fill(0).map(() => [])

    for (let yBlock = 0; yBlock < (8 / yFreq); yBlock++) {
        for (let y = 0; y < yFreq; y++) {
            for (let xBlock = 0; xBlock < (8 / xFreq); xBlock++) {
                for (let x = 0; x < xFreq; x++) {
                    out[
                        (y + (yBlock * yFreq) + (t.y * xBlock)) & 7
                    ][
                        (x + (xBlock * xFreq) + (t.x * yBlock)) & 7
                    ] = pixels[y] && pixels[y][x] || 0
                }
            }
        }
    }

    return out
}

const hi = [
    [X],
]

const lo = [
    [_,X,X,X,X,X,X,X],
    [X,X,X,X,X,X,X,X],
    [X,X,X,X,X,X,X,X],
    [X,X,X,X,X,X,X,X],
    [X,X,X,X,X,X,X,X],
    [X,X,X,X,X,X,X,X],
    [X,X,X,X,X,X,X,X],
    [X,X,X,X,X,X,X,X],
]

const brick = [
    [X,X,X,X,X,X,X,X],
    [X,_,_,_,_,_,_,_],
    [X,_,_,_,_,_,_,_],
    [X,_,_,_,_,_,_,_],
    [X,_,_,_,_,_,_,_],
    [X,_,_,_,_,_,_,_],
    [X,_,_,_,_,_,_,_],
    [X,_,_,_,_,_,_,_],
]

const bigX = [
    [X,_,_,_,X,_,_,_],
    [_,X,_,_,_,_,_,X],
    [_,_,X,_,_,_,X,_],
    [_,_,_,X,_,X,_,_],
    [X,_,_,_,X,_,_,_],
    [_,_,_,X,_,X,_,_],
    [_,_,X,_,_,_,X,_],
    [_,X,_,_,_,_,_,X],
]

export const patterns = [
    genPattern([[X]]),
    genPattern([[_]]),
    // density filters
    genPattern(hi, {xFreq: 8, yFreq: 4, tile: -4}),
    genPattern(hi, {xFreq: 8, yFreq: 2, tile: -4}),
    genPattern(hi, {xFreq: 8, yFreq: 1, tile: -3}),
    genPattern(hi, {xFreq: 4, yFreq: 1, tile: -2}),

    genPattern(hi, {xFreq: 2, yFreq: 1, tile: -1}),

    genPattern(lo, {xFreq: 4, yFreq: 1, tile: -2}),
    genPattern(lo, {xFreq: 8, yFreq: 1, tile: -5}),
    genPattern(lo, {xFreq: 8, yFreq: 2, tile: -4}),
    genPattern(lo, {xFreq: 8, yFreq: 4, tile: -4}),

    // line filters
    genPattern(lo, { xFreq: 8, yFreq: 2, tile: -2}),
    genPattern(lo, { xFreq: 4, yFreq: 2, tile: -1}),
    genPattern(lo, { xFreq: 4, yFreq: 1, tile: -1}),
    genPattern(lo, { xFreq: 1, yFreq: 4}),
    genPattern(hi, { xFreq: 1, yFreq: 2}),
    genPattern(hi, { xFreq: 1, yFreq: 4}),
    genPattern(hi, { xFreq: 4, yFreq: 1, tile: -1}),
    genPattern(hi, { xFreq: 4, yFreq: 2, tile: -1}),
    genPattern(hi, { xFreq: 8, yFreq: 2, tile: -2}),

    genPattern(brick, { xFreq: 8, yFreq: 8}),
    genPattern(brick, { xFreq: 8, yFreq: 2}),
    genPattern(brick, { xFreq: 8, yFreq: 4, tile: -4}),
    genPattern(brick, { xFreq: 2, yFreq: 4, tile: 2}),

    genPattern(bigX, { xFreq: 8, yFreq: 8}),
    genPattern(bigX, { xFreq: 8, yFreq: 4}),
    genPattern(bigX, { xFreq: 8, yFreq: 2, tile: -4}),
    genPattern([
        [X,_,_,_,],
        [_,X,_,X,],
        [_,_,X,_,],
        [_,X,_,X,],
    ], { xFreq: 4, yFreq: 4}),

    [
        [X,_,_,_,X,_,_,_],
        [_,X,_,X,X,X,_,_],
        [_,_,X,X,X,X,X,_],
        [_,_,_,X,X,X,_,X],
        [X,_,_,_,X,_,_,_],
        [X,X,_,X,_,_,_,X],
        [X,X,X,_,_,_,X,X],
        [X,X,_,_,_,X,_,X],
    ],
    [
        [X,X,X,X,X,X,X,_],
        [X,X,X,X,X,X,X,_],
        [X,X,_,_,_,_,X,_],
        [X,X,_,_,_,_,X,_],
        [X,X,_,_,_,_,X,_],
        [X,X,_,_,_,_,X,_],
        [X,X,X,X,X,X,X,_],
        [_,_,_,_,_,_,_,_],
    ],

    [
        [X,X,X,X,X,X,X,X],
        [X,X,_,X,X,X,X,X],
        [X,_,X,_,X,X,X,X],
        [_,X,_,X,_,X,X,X],
        [X,_,X,_,X,_,_,_],
        [_,X,_,X,_,_,_,_],
        [_,_,X,_,_,_,_,_],
        [_,_,_,_,_,_,_,_],
    ],

    [
        [X,X,X,X,_,X,_,X],
        [X,X,X,X,X,_,X,_],
        [X,X,X,X,_,X,_,X],
        [X,X,X,X,X,_,X,_],
        [X,_,X,_,_,_,_,_],
        [_,X,_,X,_,_,_,_],
        [X,_,X,_,_,_,_,_],
        [_,X,_,X,_,_,_,_],
    ],


].map(createPattern)
