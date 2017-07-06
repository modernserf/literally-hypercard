import {  createBrush } from "./buffer"

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
        [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
        [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
        [_,_,X,X,X,X,X,X,X,X,X,X,X,X,_,_],
        [_,_,X,X,X,X,X,X,X,X,X,X,X,X,_,_],
        [_,_,X,X,X,X,X,X,X,X,X,X,X,X,_,_],
        [_,_,X,X,X,X,X,X,X,X,X,X,X,X,_,_],
        [_,_,X,X,X,X,X,X,X,X,X,X,X,X,_,_],
        [_,_,X,X,X,X,X,X,X,X,X,X,X,X,_,_],
        [_,_,X,X,X,X,X,X,X,X,X,X,X,X,_,_],
        [_,_,X,X,X,X,X,X,X,X,X,X,X,X,_,_],
        [_,_,X,X,X,X,X,X,X,X,X,X,X,X,_,_],
        [_,_,X,X,X,X,X,X,X,X,X,X,X,X,_,_],
        [_,_,X,X,X,X,X,X,X,X,X,X,X,X,_,_],
        [_,_,X,X,X,X,X,X,X,X,X,X,X,X,_,_],
        [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
        [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
    ],
    [
        [X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X],
        [X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X],
        [X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X],
        [X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X],
        [X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X],
        [X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X],
        [X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X],
        [X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X],
        [X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X],
        [X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X],
        [X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X],
        [X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X],
        [X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X],
        [X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X],
        [X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X],
        [X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X],
    ],
    [
        [_,X,X,_],
        [X,X,X,X],
        [X,X,X,X],
        [_,X,X,_]
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
    [
        [_,_,_,_,_,X,X,X,X,X,X,_,_,_,_,_],
        [_,_,_,X,X,X,X,X,X,X,X,X,X,_,_,_],
        [_,_,X,X,X,X,X,X,X,X,X,X,X,X,_,_],
        [_,X,X,X,X,X,X,X,X,X,X,X,X,X,X,_],
        [_,X,X,X,X,X,X,X,X,X,X,X,X,X,X,_],
        [X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X],
        [X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X],
        [X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X],
        [X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X],
        [X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X],
        [X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X],
        [_,X,X,X,X,X,X,X,X,X,X,X,X,X,X,_],
        [_,X,X,X,X,X,X,X,X,X,X,X,X,X,X,_],
        [_,_,X,X,X,X,X,X,X,X,X,X,X,X,_,_],
        [_,_,_,X,X,X,X,X,X,X,X,X,X,_,_,_],
        [_,_,_,_,_,X,X,X,X,X,X,_,_,_,_,_],
    ],
].map(createBrush)


const defaultParams = {
    xFreq: 1, yFreq: 1,
    xOffset: 0, yOffset: 0,
    tile: 0
}

function p (pixels, params = {}) {
    return { pixels, ...defaultParams, ...params }
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
    p([[X]]),
    p([[_]]),
    // density filters
    p(hi, {xFreq: 8, yFreq: 4, tile: -4}),
    p(hi, {xFreq: 8, yFreq: 2, tile: -4}),
    p(hi, {xFreq: 8, yFreq: 1, tile: -3}),
    p(hi, {xFreq: 4, yFreq: 1, tile: -2}),

    p(hi, {xFreq: 2, yFreq: 1, tile: -1}),

    p(lo, {xFreq: 4, yFreq: 1, tile: -2}),
    p(lo, {xFreq: 8, yFreq: 1, tile: -5}),
    p(lo, {xFreq: 8, yFreq: 2, tile: -4}),
    p(lo, {xFreq: 8, yFreq: 4, tile: -4}),

    // line filters
    p(lo, { xFreq: 8, yFreq: 2, tile: -2}),
    p(lo, { xFreq: 4, yFreq: 2, tile: -1}),
    p(lo, { xFreq: 4, yFreq: 1, tile: -1}),
    p(lo, { xFreq: 1, yFreq: 4}),
    p(hi, { xFreq: 1, yFreq: 2}),
    p(hi, { xFreq: 1, yFreq: 4}),
    p(hi, { xFreq: 4, yFreq: 1, tile: -1}),
    p(hi, { xFreq: 4, yFreq: 2, tile: -1}),
    p(hi, { xFreq: 8, yFreq: 2, tile: -2}),

    p(brick, { xFreq: 8, yFreq: 8}),
    p(brick, { xFreq: 8, yFreq: 2}),
    p(brick, { xFreq: 8, yFreq: 4, tile: -4}),
    p(brick, { xFreq: 2, yFreq: 4, tile: 2}),

    p(bigX, { xFreq: 8, yFreq: 8}),
    p(bigX, { xFreq: 8, yFreq: 4}),
    p(bigX, { xFreq: 8, yFreq: 2, tile: -4}),
    p([
        [X,_,_,_,],
        [_,X,_,X,],
        [_,_,X,_,],
        [_,X,_,X,],
    ], { xFreq: 4, yFreq: 4}),

    p([
        [X,_,_,_,X,_,_,_],
        [_,X,_,X,X,X,_,_],
        [_,_,X,X,X,X,X,_],
        [_,_,_,X,X,X,_,X],
        [X,_,_,_,X,_,_,_],
        [X,X,_,X,_,_,_,X],
        [X,X,X,_,_,_,X,X],
        [X,X,_,_,_,X,_,X],
    ], {xFreq: 8, yFreq: 8 }),
    p([
        [X,X,X,X,X,X,X,_],
        [X,X,X,X,X,X,X,_],
        [X,X,_,_,_,_,X,_],
        [X,X,_,_,_,_,X,_],
        [X,X,_,_,_,_,X,_],
        [X,X,_,_,_,_,X,_],
        [X,X,X,X,X,X,X,_],
        [_,_,_,_,_,_,_,_],
    ], {xFreq: 8, yFreq: 8 }),
    p([
        [X,X,X,X,X,X,X,X],
        [X,X,_,X,X,X,X,X],
        [X,_,X,_,X,X,X,X],
        [_,X,_,X,_,X,X,X],
        [X,_,X,_,X,_,_,_],
        [_,X,_,X,_,_,_,_],
        [_,_,X,_,_,_,_,_],
        [_,_,_,_,_,_,_,_],
    ], {xFreq: 8, yFreq: 8 }),
    p([
        [X,X,X,X,_,X,_,X],
        [X,X,X,X,X,_,X,_],
        [X,X,X,X,_,X,_,X],
        [X,X,X,X,X,_,X,_],
        [X,_,X,_,_,_,_,_],
        [_,X,_,X,_,_,_,_],
        [X,_,X,_,_,_,_,_],
        [_,X,_,X,_,_,_,_],
    ], {xFreq: 8, yFreq: 8 }),
]
