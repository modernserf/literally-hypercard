import { getPixel } from "./buffer"

export function setForeground (fill, foreground) {
    return fill & (~0b11) + foreground
}

export function getForeground (fill) {
    return fill & 0b11
}

export function setBackground (fill, background) {
    const fg = fill & 0b11
    return fill & ~0b1100 + ((fg ^ background) << 2)
}

export function getBackground (fill) {
    const fg = fill & 0b11
    return ((fill & 0b1100) >> 2) ^ fg
}

export function setPattern (fill, patternIndex) {
    return (fill & ~0b111110000) + (patternIndex << 4)
}

export default class Palette {
    constructor ({
        colors,     // [0,1,2,3] of {r,g,b}
        patterns,   // [8x8 buffer]
    }) {
        this.colors = colors
        this.patterns = patterns
    }
    getPatterns (fill) {
        return this.patterns.map((_, i) => setPattern(fill, i))
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
    getPixel (buffer, x, y /* , frame */) {
        const colorID = getPixel(buffer, x, y)
        const fgID = colorID & 0b11
        const fgColor = this.colors[fgID]
        if (colorID < 4) { return fgColor }

        const bgID = (colorID & 0b1100) >> 2
        const bgColor = this.colors[bgID ^ fgID]

        const patternID = (colorID & 0b111110000) >> 4
        const pattern = this.patterns[patternID]

        if (colorID < 1024) {
            return getPixel(pattern, x & 7, y & 7) ? fgColor : bgColor
        }

        // TODO: animations
        return bgColor
    }
}
