import { createPattern } from "./buffer"
import { colors } from "./config"

export const cycleFill = (() => {
    const _1 = colors.cycle1, _2 = colors.cycle2, _3 = colors.cycle3, _4 = colors.cycle4

    return {
        topLeft: createPattern([
            [_1,_2,_3,_4],
            [_4,_1,_2,_3],
            [_3,_4,_1,_2],
            [_2,_3,_4,_1],
        ]),
        bottomRight: createPattern([
            [_4,_3,_2,_1],
            [_1,_4,_3,_2],
            [_2,_1,_4,_3],
            [_3,_2,_1,_4],
        ]),
    }
})()

export const brushes = (() => {
    const X = colors.black
    const _ = colors.transparent

    return [
        [
            [X,X,X],
            [X,X,X],
            [X,X,X]
        ],
        [
            [_,X,X,_],
            [X,X,X,X],
            [X,X,X,X],
            [_,X,X,_]
        ],
        [
            [_,_,X,X,X,_,_],
            [_,X,X,X,X,X,_],
            [X,X,X,X,X,X,X],
            [X,X,X,X,X,X,X],
            [X,X,X,X,X,X,X],
            [_,X,X,X,X,X,_],
            [_,_,X,X,X,_,_]
        ],
        [
            [_,_,_,_,X,X,X,_,_,_,_],
            [_,_,X,X,X,X,X,X,X,_,_],
            [_,X,X,X,X,X,X,X,X,X,_],
            [_,X,X,X,X,X,X,X,X,X,_],
            [X,X,X,X,X,X,X,X,X,X,X],
            [X,X,X,X,X,X,X,X,X,X,X],
            [X,X,X,X,X,X,X,X,X,X,X],
            [_,X,X,X,X,X,X,X,X,X,_],
            [_,X,X,X,X,X,X,X,X,X,_],
            [_,_,X,X,X,X,X,X,X,_,_],
            [_,_,_,_,X,X,X,_,_,_,_]
        ],
    ].map(createPattern)
})()

export const patterns = (() => {
    const X = colors.black
    const _ = colors.white

    return [
        [
            [_,_,_,_],
            [_,_,_,_],
            [_,_,_,_],
            [_,_,_,_],
        ],
        [
            [X,X,X,X],
            [X,X,X,X],
            [X,X,X,X],
            [X,X,X,X],
        ],
        [
            [_,_,_,_],
            [_,X,_,_],
            [_,_,_,_],
            [_,_,_,_],
        ],
        [
            [_,_,X,_],
            [_,_,_,_],
            [X,_,_,_],
            [_,_,_,_],
        ],
        [
            [_,_,_,_],
            [X,_,X,_],
            [_,_,_,_],
            [_,X,_,X],
        ],
        [
            [_,X,_,X],
            [X,_,X,_],
            [_,X,_,X],
            [X,_,X,_],
        ],
        [
            [_,X,X,X],
            [X,X,_,X],
            [_,X,X,X],
            [X,X,_,X],
        ],
        [
            [_,X,X,X],
            [X,X,X,X],
            [X,X,_,X],
            [X,X,X,X],
        ],
        [
            [X,X,X,X],
            [X,X,X,X],
            [X,X,_,X],
            [X,X,X,X],
        ],

    ].map(createPattern)
})()
