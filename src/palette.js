export function createFillPattern (fill, params) {
    if ("foreground" in params) {
        fill = (fill & ~0b11) + params.foreground
    }
    if ("background" in params) {
        const fg = fill & 0b11
        fill = (fill & ~(0b11 << 2)) + ((fg ^ params.background) << 2)
    }
    if ("pattern" in params) {
        fill =  (fill & ~(0b11111 << 4)) + (params.pattern << 4)
    }
    if ("roll" in params) {
        fill = fill & ~(0b1111111 << 9)
        if (params.roll.down) { fill += (1 << 9) }
        if (params.roll.up) { fill += (1 << 10) }
        if (params.roll.left) { fill += (1 << 11) }
        if (params.roll.right) { fill += (1 << 12) }
    } else  if ("colors" in params) {
        fill = fill & ~(0b1111111 << 9)
        const fg = fill & 0b11
        const c0 = params.colors[0] ^ fg
        const c1 = params.colors[1] ^ fg
        const c2 = params.colors[2] ^ fg
        const colors = c2 + (c1 << 2) + (c0 << 4)
        fill += (colors << 9)
    } else if ("patterns" in params) {
        fill = fill & ~(0b1111111 << 9)
        const [offset1, offset2] = params.patterns
        const offset = offset2 + (offset1 << 3)
        fill += (offset << 9) + (1 << 15)
    }
    return fill
}

export function parseFillPattern (fill) {
    const fg = fill & 0b11
    const params = {
        foreground: fg,
        background:  ((fill >> 2) & 0b11) ^ fg,
        pattern: (fill >> 4) & 0b11111,
    }

    // rolling patterns
    if (fill < 8192) {
        params.roll = {
            down: (fill >> 9) & 1,
            up: (fill >> 10) & 1,
            left: (fill >> 11) & 1,
            right: (fill >> 12) & 1
        }
    } else if (fill < 32768) {
        params.colors = [
            ((fill >> 13) & 0b11) ^ fg,
            ((fill >> 11) & 0b11) ^ fg,
            ((fill >> 9) & 0b11) ^ fg,
        ]
    } else {
        params.patterns = [
            (fill >> 12) & 0b111,
            (fill >> 9) & 0b111,
        ]
    }

    return params
}

function concatPatterns(patterns) {
    const arr = new Uint8Array(patterns.length * 64)
    for (let p = 0; p < patterns.length; p++) {
        for (let i = 0; i < 64; i++) {
            arr[i + (p * 64)] = patterns[p].data[i]
        }
    }
    return arr
}


export default class Palette {
    constructor ({
        colors,     // [0,1,2,3] of {r,g,b}
        patterns,   // [8x8 buffer]
    }) {
        this.colors = colors
        this.patterns = patterns
        this._patternBuffer = concatPatterns(patterns)
    }
    getPatterns (fill) {
        return this.patterns.map((_, i) => createFillPattern(fill, { pattern: i }))
    }
    // formats:
    // 0000 0000 0000 00ff
    // ff = foreground
    // solid color, no animation

    // xxxx xxxx xxxx 00xx
    // illegal pattern (fg same as bg)
    // transparency, masks, etc

    // aaaa aaap pppp bbff
    // ff = foreground
    // bb = background XOR foreground
    // pppp p = base pattern
    // aaaa aaa = animation

    // pattern movement
    // 000x xyyp pppp bbff
    // xx = x-roll (0, <-, ->, <->)
    // yy = y-roll (0, ⬆️, ⬇️, ↕️)

    // foreground color cycles
    // 0aab bccp pppp bbff
    // aa = color 2 XOR foreground
    // bb = color 3 XOR foreground
    // cc = color 4 XOR foreground

    // pattern wavetable synthesis
    // 1aaa bbbp pppp bbff
    // aaa = pattern 2 offset (2s comp)
    // bbb = pattern 3 offset (2s comp)
    getPixel (buffer, x, y, frame) {
        const colorID = buffer.data[x + y * buffer.width]
        const fgID = colorID & 0b11
        const fgColor = this.colors[fgID]
        // solid color
        if (colorID < 16) { return fgColor }

        const bgID = (colorID >> 2) & 0b11
        const bgColor = this.colors[bgID ^ fgID]

        const patternID = (colorID >> 4) & 0b11111

        // stationary pattern
        if (colorID < 512) {
            const patternPx = this._patternBuffer[
                (patternID << 6) + // 64px pattern offset
                (x & 7) +
                ((y & 7) << 3) // 8px row offset
            ]
            return patternPx ? fgColor : bgColor
        }

        // rolling patterns
        if (colorID < 8192) {
            const f = frame >> 2 // 15 fps
            const rollDown = (colorID >> 9) & 1
            const rollUp = (colorID >> 10) & 1
            const rollLeft = (colorID >> 11) & 1
            const rollRight = (colorID >> 12) & 1
            // TODO: alternating directions
            const offsetX = rollRight ? -f : rollLeft ? f : 0
            const offsetY = rollDown ? -f : rollUp ? f : 0

            const patternPx = this._patternBuffer[
                (patternID << 6) +
                ((x + offsetX) & 7) +
                (((y + offsetY) & 7) << 3)
            ]
            return patternPx ? fgColor : bgColor
        }

        // color cycles
        if (colorID < 32768) {
            const c1 = this.colors[((colorID >> 13) & 0b11) ^ fgID]
            const c2 = this.colors[((colorID >> 11) & 0b11) ^ fgID]
            const c3 = this.colors[((colorID >> 9) & 0b11) ^ fgID]

            const patternPx = this._patternBuffer[
                (patternID << 6) +
                (x & 7) +
                ((y & 7) << 3)
            ]

            if (patternPx) {
                switch ((frame >> 2) & 7) {
                case 0:
                    return fgColor
                case 1:
                    return (x ^ y) & 1 ? fgColor : c1
                case 2:
                    return c1
                case 3:
                    return (x ^ y) & 1 ? c1 : c2
                case 4:
                    return c2
                case 5:
                    return (x ^ y) & 1 ? c2 : c3
                case 6:
                    return c3
                case 7:
                    return (x ^ y) & 1 ? c3 : fgColor
                }
            } else {
                return bgColor
            }
        }

        // pattern wavetable
        const target = (patternID + 1 + (colorID >> 12) & 0b111) & 31
        const interpolateWith = (patternID + (colorID >> 9) & 0b111) & 31
        const dX = (x & 7) << 3
        const dY = y & 7

        const px0 = this._patternBuffer[(patternID << 6) + dX + dY] ? fgColor  : bgColor
        const px1 = this._patternBuffer[(target << 6) + dX + dY] ? fgColor  : bgColor
        const inter = this._patternBuffer[(interpolateWith << 6) + dX + dY] ? fgColor  : bgColor

        switch ((frame >> 3) & 3) {
        case 0:
            return px0
        case 1:
            return inter ? px0 : px1
        case 2:
            return px1
        case 3:
            return inter ? px1 : px0
        }

        // if all else fails
        return bgColor
    }
}
