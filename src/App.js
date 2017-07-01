import bresenham from "bresenham"
import React, { Component } from "react"
import styled from "styled-components"
import "./App.css"
import floodFillScanline from "./floodFillScanline"
import { colors, tools, brushes, patterns } from "./config"
import { getPixel, setPixel, getWidth, getHeight, createBuffer, composite, translate } from "./buffer"
import Patterns from "./Patterns"
import Canvas from "./Canvas"
import Brushes from "./Brushes"
import Tools from "./Tools"

function drawPattern (buffer, pattern, x, y) {
    const h = getHeight(pattern)
    const w = getWidth(pattern)
    const px = getPixel(pattern, x % w, y % h)
    setPixel(buffer, x, y, px)
}

function drawPencil (buffer, point) {
    setPixel(buffer, point.x, point.y, 1)
    return buffer
}

// TODO: line width
function drawLine (buffer, start, end) {
    const points = bresenham(start.x, start.y, end.x, end.y)
    for (let i = 0; i < points.length; i++) {
        setPixel(buffer, points[i].x, points[i].y, 1)
    }
    return buffer
}

function drawBrush (buffer, point, brushID, patternID) {
    const brush = brushes[brushID]
    const w = getWidth(brush)
    const h = getHeight(brush)
    const offsetX = w >> 1
    const offsetY = h >> 1
    const pattern = patterns[patternID]
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            if (getPixel(brush, x, y)) {
                drawPattern(
                    buffer,
                    pattern,
                    point.x + x - offsetX,
                    point.y + y - offsetY)
            }
        }
    }
    return buffer
}

function erase (buffer, point, brushID) {
    const brush = brushes[brushID]
    const w = getWidth(brush)
    const h = getHeight(brush)
    const offsetX = w >> 1
    const offsetY = h >> 1
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            if (getPixel(brush, x, y)) {
                setPixel(
                    buffer,
                    point.x + x - offsetX,
                    point.y + y - offsetY,
                    colors.erase)
            }
        }
    }
    return buffer
}

function setRectangle (buffer, p0, p1, withFill = false, patternID = 0) {
    const [x0, x1] = order(p0.x, p1.x)
    const [y0, y1] = order(p0.y, p1.y)
    const pattern = patterns[patternID]

    for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
            if (withFill) {
                drawPattern(buffer, pattern, x, y)
            }
            // draw sides
            if (y === y0 || y === y1 || x === x0 || x === x1) {
                setPixel(buffer, x, y, 1)
            }
        }
    }

    return buffer
}

function order (a, b) {
    return a < b ? [a,b] : [b,a]
}

function setEllipse (buffer, p0, p1, withFill, patternID) {
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

    const pattern = patterns[patternID]

    /* first half */
    for (let x = 0, y = height, sigma = 2*b2+a2*(1-2*height); b2*x <= a2*y; x++) {
        if (withFill) {
            for (let _x = xc - x; _x <= xc + x; _x++) {
                drawPattern(buffer, pattern, _x, yc + y - 1)
                drawPattern(buffer, pattern, _x, yc - y + 1)
            }
        }

        setPixel(buffer, xc + x, yc + y, 1)
        setPixel(buffer, xc - x, yc + y, 1)
        setPixel(buffer, xc + x, yc - y, 1)
        setPixel(buffer, xc - x, yc - y, 1)

        if (sigma >= 0) {
            sigma += fa2 * (1 - y)
            y--
        }
        sigma += b2 * ((4 * x) + 6)
    }

    /* second half */
    for (let x = width, y = 0, sigma = 2*a2+b2*(1-2*width); a2*y <= b2*x; y++) {
        if (withFill) {
            for (let _x = xc - x; _x <= xc + x; _x++) {
                drawPattern(buffer, pattern, _x, yc + y)
                drawPattern(buffer, pattern, _x, yc - y)
            }
        }

        setPixel(buffer, xc + x, yc + y, 1)
        setPixel(buffer, xc - x, yc + y, 1)
        setPixel(buffer, xc + x, yc - y, 1)
        setPixel(buffer, xc - x, yc - y, 1)

        if (sigma >= 0) {
            sigma += fb2 * (1 - x)
            x--
        }
        sigma += a2 * ((4 * y) + 6)
    }

    return buffer
}

function setFill (buffer, point, patternID) {
    const width = getWidth(buffer)
    const height = getHeight(buffer)
    const dest = createBuffer(width, height)
    const fillTest = composite(buffer, createBuffer(width, height))
    const pattern = patterns[patternID]
    const test = (x, y) => {
        if (x < 0 || y < 0 || x >= width || y >= height) { return false }
        return !getPixel(fillTest, x, y)
    }
    const paint = (x, y) => {
        setPixel(fillTest, x, y, 1)
        drawPattern(dest, pattern, x, y)
    }
    floodFillScanline(point.x, point.y, width, height, false, test, paint)
    return composite(buffer, dest)
}

function createSelection (buffer, p0, p1) {
    const [x0, x1] = order(p0.x, p1.x)
    const [y0, y1] = order(p0.y, p1.y)
    const out = createBuffer(buffer.width, buffer.height)
    for (let y = 0; y < buffer.height; y++) {
        for (let x = 0; x < buffer.width; x++) {
            if ((x0 <= x && x <= x1) && (y0 <= y && y <= y1)) {
                setPixel(out, x, y, getPixel(buffer, x, y))
            }
        }
    }
    return out
}

function blankSelection (buffer) {
    const out = createBuffer(buffer.width, buffer.height)
    for (let y = 0; y < buffer.height; y++) {
        for (let x = 0; x < buffer.width; x++) {
            if (getPixel(buffer, x, y)) {
                setPixel(out, x, y, colors.erase)
            }
        }
    }
    return out
}

function inSelection (selection, point) {
    return !!getPixel(selection, point.x, point.y)
}

const initState = {
    width: 256,
    height: 256,
    scale: 1,
    tool: "brush",
    brush: 3,
    pattern: 1,
    undoBuffer: createBuffer(256, 256),
    pixels: createBuffer(256, 256),
    startPoint: null,
    lastPoint: null,
    fillShapes: true,
    selection: null,
    selectionMarquee: null,
}

function reducer (state, type, payload) {
    // set tools
    if (type === "selectTool") {
        return {
            ...commitSelection(state),
            tool: payload,
        }
    }
    if (type === "selectBrush") {
        return { brush: payload }
    }
    if (type === "selectPattern") {
        return { pattern: payload }
    }

    if (type === "undo" && state.selection) {
        return {
            selection: null,
            selectionMarquee: null,
            preview: null,
        }
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
        const preview = drawPencil(createBuffer(state.width, state.height), payload)
        return {
            lastPoint: payload,
            preview,
        }
    }
    if (state.tool === "pencil" && type === "drag") {
        const points = bresenham(state.lastPoint.x, state.lastPoint.y, payload.x, payload.y)
        const preview = points.reduce((acc, point) => drawPencil(acc, point), state.preview)
        return {
            lastPoint: payload,
            preview,
        }
    }

    if (state.tool === "brush" && type === "down") {
        const preview = drawBrush(createBuffer(state.width, state.height), payload, state.brush, state.pattern)
        return {
            lastPoint: payload,
            preview,
        }
    }
    if (state.tool === "brush" && type === "drag") {
        const points = bresenham(state.lastPoint.x, state.lastPoint.y, payload.x, payload.y)
        const preview = points.reduce((acc, point) =>
            drawBrush(acc, point, state.brush,  state.pattern),
        state.preview)
        return {
            lastPoint: payload,
            preview,
        }
    }

    if (state.tool === "eraser" && type === "down") {
        const preview = erase(createBuffer(state.width, state.height), payload, state.brush)
        return {
            lastPoint: payload,
            preview
        }
    }
    if (state.tool === "eraser" && type === "drag") {
        const points = bresenham(state.lastPoint.x, state.lastPoint.y, payload.x, payload.y)
        const preview = points.reduce((acc, point) =>
            erase(acc, point, state.brush),
        state.preview)
        return {
            lastPoint: payload,
            preview,
        }
    }

    // shapelike tools -- stateless preview
    if (["line","rectangle","ellipse"].includes(state.tool) && type === "down") {
        return {
            startPoint: payload,
        }
    }
    if (state.tool === "line" && state.startPoint && type === "drag") {
        return {
            preview: drawLine(createBuffer(state.width, state.height), state.startPoint, payload)
        }
    }

    if (state.tool === "rectangle" && state.startPoint && type === "drag") {
        const preview = setRectangle(
            createBuffer(state.width, state.height),
            state.startPoint,
            payload,
            state.fillShapes,
            state.pattern)
        return {
            preview,
        }
    }

    if (state.tool === "ellipse" &&  state.startPoint && type === "drag") {
        const preview = setEllipse(
            createBuffer(state.width, state.height),
            state.startPoint,
            payload,
            state.fillShapes,
            state.pattern)
        return {
            preview,
        }
    }

    if (["pencil","brush","eraser","line","rectangle","ellipse"].includes(state.tool) &&
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
        const pixels = setFill(state.pixels, payload, state.pattern, state.width, state.height)
        return {
            undoBuffer: state.pixels,
            pixels
        }
    }

    if (state.tool === "select" && type === "down" && state.selection &&
        !inSelection(state.selection, payload)) {
        return {
            ...commitSelection(state),
            startPoint: payload,
        }
    }


    if (state.tool === "select" && type === "down") {
        return {
            startPoint: payload,
        }
    }

    if (state.tool === "select" && type === "drag" && state.selection) {
        return {
            selection: translate(state.selection, state.startPoint, payload),
            selectionMarquee: translate(state.selectionMarquee, state.startPoint, payload),
        }
    }

    if (state.tool === "select" && type === "drag") {
        return {
            selectionMarquee: setRectangle(
                createBuffer(state.width, state.height),
                state.startPoint,
                payload)
        }
    }

    if (state.tool === "select" && state.selection && type === "up") {
        return {
            startPoint: null,
            selection: composite(createBuffer(state.width, state.height), state.selection),
            selectionMarquee: composite(createBuffer(state.width, state.height), state.selectionMarquee),
        }
    }

    if (state.tool === "select" && state.startPoint && type === "up") {
        const selection = createSelection(state.pixels, state.startPoint, payload)
        return {
            startPoint: null,
            selection: selection,
            preview: blankSelection(selection),
        }
    }
}

function commitSelection (state) {
    if (!state.selection) { return {} }
    return {
        undoBuffer: state.pixels,
        pixels: composite(composite(state.pixels, state.preview), state.selection),
        selection: null,
        selectionMarquee: null,
        preview: null,
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
        const pixels = [
            this.state.pixels,
            this.state.preview,
            this.state.selection,
            this.state.selectionMarquee
        ].reduce(composite)

        return (
            <div className="App">
                <Canvas pixels={pixels}
                    dispatch={this.dispatch}
                    scale={this.state.scale} />
                <Flex>
                    <Tools selected={this.state.tool}
                        dispatch={this.dispatch}
                        tools={tools}/>
                    <Brushes selected={this.state.brush}
                        dispatch={this.dispatch}
                        scale={this.state.scale}
                        brushes={brushes}/>
                    <Patterns selected={this.state.pattern}
                        dispatch={this.dispatch}
                        patterns={patterns}
                        scale={this.state.scale}/>
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
