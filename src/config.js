export const width = 256
export const height = 256
export const scale = 1

export const tools = ["pencil", "brush", "eraser", "line", "rectangle", "elipse", "bucket", "select"]

export const colors = {
    transparent: 0,
    black: 1,
    white: 2,
    selection: 3,
    erase: 4,
}

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
    ]
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
            [_,X,_,X],
            [X,_,X,_],
            [_,X,_,X],
            [X,_,X,_],
        ],
        [
            [_,X,X,X],
            [X,X,X,X],
            [X,X,_,X],
            [X,X,X,X],
        ],
        [
            [_,_,X,_],
            [_,_,_,_],
            [X,_,_,_],
            [_,_,_,_],
        ]
    ]
})()
