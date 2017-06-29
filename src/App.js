import bresenham from "bresenham"
import React, { Component } from "react"
import styled from "styled-components"
import "./App.css"
import floodFillScanline from "./floodFillScanline"
import { colors, width, height, scale, tools, brushes, patterns } from "./config"
import Patterns from "./Patterns"
import Canvas from "./Canvas"
import Brushes from "./Brushes"
import Tools from "./Tools"

function drawPoint (buffer, x, y, value) {
    if (x < 0 || y < 0 || x >= width || y >= height) { return }
    buffer[y][x] = value
}

function drawPattern (buffer, x, y, patternID) {
    const pattern = patterns[patternID]
    if (x < 0 || y < 0 || x >= width || y >= height) { return }
    const h = pattern.length
    const w = pattern[0].length
    buffer[y][x] = pattern[y % h][x % w]
}

function setPencil (buffer, point) {
    drawPoint(buffer, point.x, point.y, 1)
    return buffer
}

function setBrush (buffer, point, brush, patternID) {
    const { x: offsetX, y: offsetY, pattern } = brushes[brush]
    for (let y = 0; y < pattern.length; y++) {
        for (let x = 0; x < pattern[y].length; x++) {
            if (pattern[y][x]) {
                drawPattern(
                    buffer,
                    point.x + offsetX + x,
                    point.y + offsetY + y,
                    patternID)
            }
        }
    }
    return buffer
}

function setRectangle (buffer, p0, p1, withFill = false, patternID = 0) {
    const [x0, x1] = order(p0.x, p1.x)
    const [y0, y1] = order(p0.y, p1.y)

    for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
            if (withFill) {
                drawPattern(buffer, x, y, patternID)
            }
            // draw sides
            if (y === y0 || y === y1 || x === x0 || x === x1) {
                drawPoint(buffer, x, y, 1)
            }
        }
    }

    return buffer
}

function order (a, b) {
    return a < b ? [a,b] : [b,a]
}

function setElipse (buffer, p0, p1, withFill, patternID) {
    const [x0, x1] = order(p0.x, p1.x)
    const [y0, y1] = order(p0.y, p1.y)
    // radii
    const width = (x1 - x0) >> 1
    const height = (y1 - y0) >> 1
    if (!width || !height) { return buffer }

    const xc = x0 + width
    const yc = y0 + height

    const a2 = width * width
    const b2 = height * height
    const fa2 = 4 * a2
    const fb2 = 4 * b2

    /* first half */
    for (let x = 0, y = height, sigma = 2*b2+a2*(1-2*height); b2*x <= a2*y; x++) {
        // draw border
        drawPoint(buffer, xc + x, yc + y, 1)
        drawPoint(buffer, xc - x, yc + y, 1)
        drawPoint(buffer, xc + x, yc - y, 1)
        drawPoint(buffer, xc - x, yc - y, 1)

        if (withFill) {
            for (let _x = xc - x; _x <= xc + x; _x++) {
                drawPattern(buffer, _x, yc + y, patternID)
                drawPattern(buffer, _x, yc - y, patternID)
            }
        }

        if (sigma >= 0) {
            sigma += fa2 * (1 - y)
            y--
        }
        sigma += b2 * ((4 * x) + 6)
    }

    /* second half */
    for (let x = width, y = 0, sigma = 2*a2+b2*(1-2*width); a2*y <= b2*x; y++) {
        drawPoint(buffer, xc + x, yc + y, 1)
        drawPoint(buffer, xc - x, yc + y, 1)
        drawPoint(buffer, xc + x, yc - y, 1)
        drawPoint(buffer, xc - x, yc - y, 1)

        if (withFill) {
            for (let _x = xc - x; _x <= xc + x; _x++) {
                drawPattern(buffer, _x, yc + y, patternID)
                drawPattern(buffer, _x, yc - y, patternID)
            }
        }

        if (sigma >= 0) {
            sigma += fb2 * (1 - x)
            x--
        }
        sigma += a2 * ((4 * y) + 6)
    }

    return buffer
}

function setFill (buffer, point, patternID) {
    const dest = createBuffer(width, height)
    const fillTest = composite(buffer, createBuffer(width, height))
    const test = (x, y) => {
        if (x < 0 || y < 0 || x >= width || y >= height) { return false }
        return !fillTest[y][x]
    }
    const paint = (x, y) => {
        drawPoint(fillTest, x, y, 1)
        drawPattern(dest, x, y, patternID)
    }
    floodFillScanline(point.x, point.y, width, height, false, test, paint)
    return composite(buffer, dest)
}

function createBuffer (width, height) {
    return Array(height).fill(0).map(() =>
        Array(width).fill(colors.transparent))
}

function composite (bottom, top) {
    if (!top) { return bottom }
    const out = []
    for (let y = 0; y < height; y++) {
        const line = []
        for (let x = 0; x < width; x++) {
            if (top[y][x] === colors.transparent) {
                line.push(bottom[y][x])
            } else if (top[y][x] === colors.selection) {
                if (bottom[y][x] === colors.black) {
                    line.push(colors.white)
                } else {
                    line.push(colors.black)
                }
            } else {
                line.push(top[y][x])
            }
        }
        out.push(line)
    }
    return out
}

function createSelection (buffer, p0, p1) {
    const [x0, x1] = order(p0.x, p1.x)
    const [y0, y1] = order(p0.y, p1.y)
    const out = []
    for (let y = 0; y < height; y++) {
        const line = []
        for (let x = 0; x < width; x++) {
            if ((x0 <= x && x <= x1) && (y0 <= y && y <= y1)) {
                line.push(colors.selection)
            } else {
                line.push(colors.transparent)
            }
        }
        out.push(line)
    }
    return out
}

function inSelection (selection, point) {
    return !!selection &&
        selection[point.y] &&
        selection[point.y][point.x] === colors.selection
}

const initState = {
    tool: "elipse",
    brush: 3,
    pattern: 2,
    undoBuffer: createBuffer(width, height),
    pixels: createBuffer(width, height),
    startPoint: null,
    lastPoint: null,
    fillShapes: true,
    selection: null,
}

function reducer (state, type, payload) {
    // set tools
    if (type === "selectTool") {
        return { tool: payload }
    }
    if (type === "selectBrush") {
        return { brush: payload }
    }
    if (type === "selectPattern") {
        return { pattern: payload }
    }

    if (type === "undo") {
        return {
            pixels: state.undoBuffer,
            undoBuffer: state.pixels,
        }
    }

    if (type === "toggleFillShapes") {
        return { fillShapes: !state.fillShapes }
    }

    // brushlike tools -- accumulative preview
    if (state.tool === "pencil" && type === "down") {
        const preview = setPencil(createBuffer(width, height), payload)
        return {
            lastPoint: payload,
            preview,
        }
    }
    if (state.tool === "pencil" && type === "drag") {
        const points = bresenham(state.lastPoint.x, state.lastPoint.y, payload.x, payload.y)
        const preview = points.reduce((acc, point) => setPencil(acc, point), state.preview)
        return {
            lastPoint: payload,
            preview,
        }
    }

    if (state.tool === "brush" && type === "down") {
        const preview = setBrush(createBuffer(width, height), payload, state.brush, state.pattern)
        return {
            lastPoint: payload,
            preview,
        }
    }
    if (state.tool === "brush" && type === "drag") {
        const points = bresenham(state.lastPoint.x, state.lastPoint.y, payload.x, payload.y)
        const preview = points.reduce((acc, point) =>
            setBrush(acc, point, state.brush,  state.pattern),
        state.preview)
        return {
            lastPoint: payload,
            preview,
        }
    }

    if (state.tool === "eraser" && type === "down") {
        const preview = setBrush(createBuffer(width, height), payload, state.brush, 0)
        return {
            lastPoint: payload,
            preview
        }
    }
    if (state.tool === "eraser" && type === "drag") {
        const points = bresenham(state.lastPoint.x, state.lastPoint.y, payload.x, payload.y)
        const preview = points.reduce((acc, point) =>
            setBrush(acc, point, state.brush, 0),
        state.preview)
        return {
            lastPoint: payload,
            preview,
        }
    }

    // shapelike tools -- stateless preview
    if (state.tool === "line" && type === "down") {
        const preview = setPencil(createBuffer(width, height), payload)
        return {
            startPoint: payload,
            preview,
        }
    }
    if (state.tool === "line" && state.startPoint && type === "drag") {
        const points = bresenham(state.startPoint.x, state.startPoint.y, payload.x, payload.y)
        const preview = points.reduce(
            (acc, point) => setPencil(acc, point),
            createBuffer(width, height))
        return {
            preview,
        }
    }

    if (state.tool === "rectangle" && type === "down") {
        const preview = setPencil(createBuffer(width, height), payload)
        return {
            startPoint: payload,
            preview,
        }
    }
    if (state.tool === "rectangle" && state.startPoint && type === "drag") {
        const preview = setRectangle(
            createBuffer(width, height),
            state.startPoint,
            payload,
            state.fillShapes,
            state.pattern)
        return {
            preview,
        }
    }

    if (state.tool === "elipse" && type === "down") {
        return {
            startPoint: payload,
            preview: createBuffer(width, height),
        }
    }
    if (state.tool === "elipse" &&  state.startPoint && type === "drag") {
        const preview = setElipse(
            createBuffer(width, height),
            state.startPoint,
            payload,
            state.fillShapes,
            state.pattern)
        return {
            preview,
        }
    }

    if (["pencil","brush","eraser","line","rectangle","elipse"].includes(state.tool) &&
        state.preview && type === "up") {
        return {
            startPoint: null,
            lastPoint: null,
            undoBuffer: state.pixels,
            pixels: composite(state.pixels, state.preview),
            preview: null,
        }
    }

    if (state.tool === "bucket" && type === "down") {
        const pixels = setFill(state.pixels, payload, state.pattern)
        return {
            undoBuffer: state.pixels,
            pixels
        }
    }

    if (state.tool === "select" && type === "down" && inSelection(state.selection, payload)) {
        return {
            startPoint: payload,
            movingSelection: true
        }
    }

    if (state.tool === "select" && type === "down") {
        return {
            startPoint: payload
        }
    }

    if (state.tool === "select" && type === "drag" && state.movingSelection) {
        return {
            preview: blankSelection(state.selection),
            translateSelection: translate(state.selection, state.startPoint, payload),
        }
    }

    if (state.tool === "select" && type === "drag") {
        const preview = setRectangle(
            createBuffer(width, height),
            state.startPoint,
            payload)
        return {
            preview,
        }
    }

    if (state.tool === "select" && type === "up" && state.movingSelection) {
        const copy = copySelection(state.pixels, state.selection)

        return {
            startPoint: null,
            undoBuffer: state.pixels,
            preview: null,
            pixels: composite(
                deleteSelection(state.pixels, state.selection),
                copySelection(state.pixels, state.selection))
        }
    }

    if (state.tool === "select" && state.startPoint && type === "up") {
        return {
            preview: null,
            startPoint: null,
            selection: createSelection(state.pixels, state.startPoint, payload),
            movingSelection: false,
        }
    }
}

const Flex = styled.div`
    display: flex;
    > div {
        padding: 10px;
    }
`

class App extends Component {
    state = initState
    dispatch = (type, payload) => {
        this.setState((state) => reducer(state, type, payload) || {})
    }
    render() {
        const pixels = composite(
            composite(this.state.pixels, this.state.preview),
            this.state.selection)

        return (
            <div className="App">
                <Canvas pixels={pixels}
                    dispatch={this.dispatch}
                    width={width} height={height} scale={scale}/>
                <Flex>
                    <Tools selected={this.state.tool}
                        dispatch={this.dispatch}
                        tools={tools}/>
                    <Brushes selected={this.state.brush}
                        dispatch={this.dispatch}
                        scale={scale}
                        brushes={brushes}/>
                    <Patterns selected={this.state.pattern}
                        dispatch={this.dispatch}
                        patterns={patterns}
                        scale={scale}/>
                    <div>
                        <h3>edit</h3>
                        <button onClick={() => this.dispatch("undo")}>
                            undo
                        </button>
                    </div>
                    <div>
                        <h3>fill shapes</h3>
                        <button onClick={() => this.dispatch("toggleFillShapes")}>
                            {this.state.fillShapes ? "filled" : "empty"}
                        </button>
                    </div>
                </Flex>
            </div>
        )
    }
}

export default App
