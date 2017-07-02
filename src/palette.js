import { getPixel } from "./buffer"

export default class Palette {
    constructor ({
        foreground, // {r,g,b,a} 0-255
        background, // {r,g,b,a} 0-255
        patterns,   // [4x4 buffer]
        cycles = [],     // [{rate, frames: [4x4 buffer]}]
    }) {
        this._foreground = foreground
        this._background = background
        this._patternLength = patterns.length
        this._index = patterns.concat(cycles)
    }
    get patterns () {
        return this._index.map((_,i) => i)
    }
    getPixel (buffer, x, y, frame) {
        const fg = this._foreground
        const bg = this._background
        const patternID = getPixel(buffer, x, y)
        if (patternID === 0) { return bg }
        if (patternID === 1) { return fg }
        if (patternID < this._patternLength) {
            return getPixel(this._index[patternID], x & 3, y & 3) ? fg : bg
        }
        const { rate, frames } = this._index[patternID]
        const pattern = frames[(frame >> rate) % frames.length]
        return getPixel(pattern, x & 3, y & 3) ? fg : bg
    }
}
