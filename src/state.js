import { brushes, patterns as basePatterns } from "./resources"
import { createPattern } from "./pattern"
import { createBuffer, copy, flipHorizontal, flipVertical, setImageData } from "./buffer"
import { hexToColor } from "./palette"

import { drawBrush, drawPencil, drawRectangle, erase, drawLine, drawEllipse, drawFill } from "./draw"


const size = 256

const white = hexToColor("#FFFFFF")
const black = hexToColor("#000000")
const navy = hexToColor("#333366")
const amber = hexToColor("#CC9900")


export const initState = {
    empty: false,
    width: size,
    height: size,
    scale: 1,
    tool: "brush",
    brush: 0,
    fill: 1,
    stroke: 1,
    patterns: basePatterns,
    pattern: 0,
    undoBuffer: createBuffer(size, size),
    pixels: createBuffer(size, size),
    startPoint: null,
    lastPoint: null,
    fillShapes: true,
    colors: [white, black, amber, navy],
}



export function reducer (state, type, payload) {
    const brush = brushes[state.brush]
    const pattern = createPattern(state.patterns[state.pattern])

    // set tools
    if (type === "selectTool") {
        return {
            tool: payload,
        }
    }
    if (type === "selectBrush") {
        return { brush: payload }
    }

    if (type === "undo") {
        return {
            pixels: state.undoBuffer,
            undoBuffer: state.pixels,
        }
    }

    if (type === "clear") {
        return {
            undoBuffer: state.pixels,
            pixels: createBuffer(state.width, state.height),
        }
    }

    if (type === "flip horizontal") {
        return {
            undoBuffer: state.pixels,
            pixels: flipHorizontal(state.pixels),
        }
    }

    if (type === "flip vertical") {
        return {
            undoBuffer: state.pixels,
            pixels: flipVertical(state.pixels),
        }
    }

    if (type === "toggleFillShapes") {
        return { fillShapes: !state.fillShapes }
    }

    if (type === "setFill") {
        return {
            fill: payload,
        }
    }

    if (type === "setStroke") {
        return {
            stroke: payload,
        }
    }

    if (type === "setPattern") {
        return {
            pattern: payload,
        }
    }

    if (type === "setColorValue") {
        const { color, index } = payload

        state.colors[index] = color
        return {
            colors: state.colors,
        }
    }

    // brushlike tools -- accumulative preview
    if (state.tool === "pencil" && type === "down") {
        // TODO: how should "erasing" work?
        // const value = getPixel(state.pixels, payload.x, payload.y) ? 0 : state.stroke
        const value = state.stroke
        return {
            lastPoint: payload,
            pencilValue: value,
            undoBuffer: state.pixels,
            pixels: drawPencil(copy(state.pixels), { start: payload, stroke: value })
        }
    }
    if (state.tool === "pencil" && type === "drag") {
        return {
            lastPoint: payload,
            pixels: drawPencil(state.pixels, { start: state.lastPoint, end: payload, stroke: state.pencilValue }),
        }
    }

    if (state.tool === "brush" && type === "down") {
        return {
            lastPoint: payload,
            undoBuffer: state.pixels,
            pixels: drawBrush(copy(state.pixels), {start: payload, brush, fill: state.fill, pattern})
        }
    }
    if (state.tool === "brush" && type === "drag") {
        return {
            lastPoint: payload,
            pixels: drawBrush(state.pixels,
                {start: state.lastPoint, end: payload, brush, fill: state.fill, pattern})
        }
    }

    if (state.tool === "eraser" && type === "down") {
        return {
            lastPoint: payload,
            undoBuffer: state.pixels,
            pixels: erase(copy(state.pixels), { start: payload, brush })
        }
    }
    if (state.tool === "eraser" && type === "drag") {
        return {
            lastPoint: payload,
            pixels: erase(state.pixels, {start: state.lastPoint, end: payload, brush })
        }
    }

    // shapelike tools -- stateless preview
    if (["line","rectangle","ellipse"].includes(state.tool) && type === "down") {
        return {
            startPoint: payload,
            undoBuffer: state.pixels,
        }
    }
    if (state.tool === "line" && state.startPoint && type === "drag") {
        return {
            pixels: drawLine(copy(state.undoBuffer),
                { start: state.startPoint, end: payload, brush, stroke: state.stroke})
        }
    }

    if (state.tool === "rectangle" && state.startPoint && type === "drag") {
        return {
            pixels: drawRectangle(copy(state.undoBuffer), {
                start: state.startPoint,
                end: payload,
                isFilled: state.fillShapes,
                brush,
                stroke: state.stroke,
                fill: state.fill
            })
        }
    }

    if (state.tool === "ellipse" && state.startPoint && type === "drag") {
        return {
            pixels: drawEllipse(copy(state.undoBuffer), {
                start: state.startPoint,
                end: payload,
                isFilled: state.fillShapes,
                brush,
                stroke: state.stroke,
                fill: state.fill
            })
        }
    }

    if (["pencil","brush","eraser","line","rectangle","ellipse"].includes(state.tool) && type === "up") {
        return {
            pencilValue: null,
            startPoint: null,
            lastPoint: null,
        }
    }

    if (state.tool === "bucket" && type === "down") {
        return {
            undoBuffer: state.pixels,
            pixels: drawFill(copy(state.pixels), { point: payload, fill: state.fill, pattern })
        }
    }

    if (type === "updatePattern") {
        state.patterns[payload.id] = payload.pattern
        return {
            patterns: state.patterns,
        }
    }

    if (type === "download") {
        const canvas = document.createElement("canvas")
        canvas.width = state.width << state.scale
        canvas.height = state.height << state.scale
        const ctx = canvas.getContext("2d")
        setImageData(ctx, state.pixels, state.scale, 0, state.colors)
        const url = canvas.toDataURL()
        window.open(url, "_blank")
    }
}
