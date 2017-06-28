import PropTypes from "prop-types"
import bresenham from "bresenham"
import React, { Component } from "react"
import styled from "styled-components"
import "./App.css"
import floodFillScanline from "./floodFillScanline"

const width = 256
const height = 256
const scale = 1

class Canvas extends Component {
    static propTypes = {
        pixels: PropTypes.array.isRequired,
        dispatch: PropTypes.func.isRequired,
    }
    state = {
        mouseDown: false,
    }
    componentDidMount () {
        if (this.ctx) { this.renderCanvas() }
    }
    shouldComponentUpdate () {
        return false
    }
    initRef = (e) => {
        this._ref = e
        this.ctx = e.getContext("2d")
    }
    renderCanvas = () => {
        this.ctx.fillStyle = "white"
        this.ctx.fillRect(0,0, width << scale, height << scale)

        this.ctx.fillStyle = "black"
        for (let y = 0; y < height; y++) {
            for(let x = 0; x < width; x++) {
                if (this.props.pixels[y][x]) {
                    this.ctx.fillRect(
                        x << scale,
                        y << scale,
                        1 << scale,
                        1 << scale)
                }
            }
        }
        requestAnimationFrame(this.renderCanvas)
    }
    getPoint = (e) => {
        const { top, left } = this._ref.getBoundingClientRect()
        const x = e.clientX - left
        const y = e.clientY - top
        return { x: x >> scale, y: y >> scale }
    }
    onMouseDown = (e) => {
        this.setState({ mouseDown: true })
        this.props.dispatch("down", this.getPoint(e))
    }
    onMouseMove = (e) => {
        const msg = this.state.mouseDown ? "drag" : "move"
        this.props.dispatch(msg, this.getPoint(e))
    }
    onMouseUp = (e) => {
        this.setState({ mouseDown: false })
        this.props.dispatch("up", this.getPoint(e))
    }
    render () {
        return (
            <canvas ref={this.initRef}
                width={width << scale} height={height << scale}
                onMouseDown={this.onMouseDown}
                onMouseUp={this.onMouseUp}
                onMouseMove={this.onMouseMove}
                onMouseLeave={this.onMouseUp}
            />
        )
    }
}

const tools = ["pencil", "brush", "eraser", "line", "rectangle", "elipse", "bucket"]

function Tools ({ dispatch }) {
    return (
        <div>
            <h3>tools</h3>
            <ul>{tools.map((tool) => (
                <li key={tool}>
                    <button onClick={() => dispatch("selectTool", tool)}>
                        {tool}
                    </button>
                </li>
            ))}</ul>
        </div>
    )
}

const brushes = [
    { x: 0, y: 0,   pattern: [
        [1]] },
    { x: 0, y: 0,   pattern: [
        [1,1],
        [1,1]] },
    { x: -1, y: -1, pattern: [
        [1,1,1],
        [1,1,1],
        [1,1,1]] },
    { x: -1, y: -1, pattern: [
        [0,1,1,0],
        [1,1,1,1],
        [1,1,1,1],
        [0,1,1,0]] },
]

function Brushes ({ dispatch }) {
    return (
        <div>
            <h3>brushes</h3>
            <ul>{brushes.map((_,i) => (
                <li key={i}>
                    <button onClick={() => dispatch("selectBrush", i)}>
                        {i}
                    </button>
                </li>
            ))}</ul>
        </div>
    )
}

const patterns = [
    [[0]],
    [[1]],
    [
        [0,1],
        [1,0],
    ],
    [
        [0,1,1,1],
        [1,1,1,1],
        [1,1,0,1],
    ],
    [
        [0,0,1,0],
        [0,0,0,0],
        [1,0,0,0]
    ]
]

function Patterns ({ dispatch }) {
    return (
        <div>
            <h3>patterns</h3>
            <ul>{patterns.map((_,i) => (
                <li key={i}>
                    <button onClick={() => dispatch("selectPattern", i)}>
                        {i}
                    </button>
                </li>
            ))}</ul>
        </div>
    )
}


function setPoint (buffer, x, y, value) {
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
    setPoint(buffer, point.x, point.y, 1)
    return buffer
}

function setBrush (buffer, point, brush, patternID) {
    const { x: offsetX, y: offsetY, pattern } = brushes[brush]
    for (let y = 0; y < pattern.length; y++) {
        for (let x = 0; x < pattern[y].length; x++) {
            drawPattern(
                buffer,
                point.x + offsetX + x,
                point.y + offsetY + y,
                patternID)
        }
    }
    return buffer
}

function setRectangle (buffer, { x: x0, y: y0 }, { x: x1, y: y1 }) {
    const sides = [
        // TODO: these lines can be rendered without bresenham
        bresenham(x0, y0, x0, y1),
        bresenham(x0, y0, x1, y0),
        bresenham(x1, y0, x1, y1),
        bresenham(x0, y1, x1, y1)
    ]

    for (const side of sides) {
        for (const point of side) {
            buffer[point.y][point.x] = 1
        }
    }
    return buffer
}

function order (a, b) {
    return a < b ? [a,b] : [b,a]
}

function setElipse (buffer, p0, p1) {
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
        setPoint(buffer, xc + x, yc + y, 1)
        setPoint(buffer, xc - x, yc + y, 1)
        setPoint(buffer, xc + x, yc - y, 1)
        setPoint(buffer, xc - x, yc - y, 1)
        if (sigma >= 0) {
            sigma += fa2 * (1 - y)
            y--
        }
        sigma += b2 * ((4 * x) + 6)
    }

    /* second half */
    for (let x = width, y = 0, sigma = 2*a2+b2*(1-2*width); a2*y <= b2*x; y++) {
        setPoint(buffer, xc + x, yc + y, 1)
        setPoint(buffer, xc - x, yc + y, 1)
        setPoint(buffer, xc + x, yc - y, 1)
        setPoint(buffer, xc - x, yc - y, 1)
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
        setPoint(fillTest, x, y, 1)
        drawPattern(dest, x, y, patternID)
    }
    floodFillScanline(point.x, point.y, width, height, false, test, paint)
    return composite(buffer, dest)
}

function createBuffer (width, height) {
    return Array(height).fill(0).map(() =>
        Array(width).fill(0))
}

function composite (bottom, top) {
    if (!top) { return bottom }
    const out = []
    for (let y = 0; y < height; y++) {
        const line = []
        for (let x = 0; x < width; x++) {
            line.push(bottom[y][x] | top[y][x])
        }
        out.push(line)
    }
    return out
}

const initState = {
    tool: "pencil",
    brush: 3,
    pattern: 1,
    pixels: createBuffer(width, height),
    startPoint: null,
    lastPoint: null,
}

function reducer (state, type, payload) {
    if (type === "selectTool") {
        return { tool: payload }
    }
    if (type === "selectBrush") {
        return { brush: payload }
    }
    if (type === "selectPattern") {
        return { pattern: payload }
    }
    if (state.tool === "pencil" && type === "down") {
        const px = setPencil(state.pixels, payload)
        return {
            lastPoint: payload,
            pixels: px
        }
    }
    if (state.tool === "pencil" && type === "drag") {
        const points = bresenham(state.lastPoint.x, state.lastPoint.y, payload.x, payload.y)
        const px = points.reduce((acc, point) => setPencil(acc, point), state.pixels)
        return {
            lastPoint: payload,
            pixels: px
        }
    }
    if (state.tool === "brush" && type === "down") {
        const px = setBrush(state.pixels, payload, state.brush, state.pattern)
        return {
            lastPoint: payload,
            pixels: px,
        }
    }
    if (state.tool === "brush" && type === "drag") {
        if (!state.lastPoint) { return }
        const points = bresenham(state.lastPoint.x, state.lastPoint.y, payload.x, payload.y)
        const px = points.reduce((acc, point) =>
            setBrush(acc, point, state.brush,  state.pattern),
        state.pixels)
        return {
            lastPoint: payload,
            pixels: px
        }
    }
    if (state.tool === "eraser" && type === "down") {
        const px = setBrush(state.pixels, payload, state.brush, 0)
        return {
            lastPoint: payload,
            pixels: px,
        }
    }
    if (state.tool === "eraser" && type === "drag") {
        if (!state.lastPoint) { return }
        const points = bresenham(state.lastPoint.x, state.lastPoint.y, payload.x, payload.y)
        const px = points.reduce((acc, point) =>
            setBrush(acc, point, state.brush, 0),
        state.pixels)
        return {
            lastPoint: payload,
            pixels: px
        }
    }
    if (state.tool === "line" && type === "down") {
        const pixels = setPencil(state.pixels, payload)
        return {
            startPoint: payload,
            pixels,
        }
    }
    if (state.tool === "line" && type === "drag") {
        if (!state.startPoint) { return }
        const points = bresenham(state.startPoint.x, state.startPoint.y, payload.x, payload.y)
        const preview = points.reduce(
            (acc, point) => setPencil(acc, point),
            createBuffer(width, height))
        return {
            preview,
        }
    }
    if (state.tool === "line" && type === "up") {
        if (!state.startPoint) { return }
        const points = bresenham(state.startPoint.x, state.startPoint.y, payload.x, payload.y)
        const pixels = points.reduce(
            (acc, point) => setPencil(acc, point),
            state.pixels)
        return {
            pixels,
            startPoint: null,
        }
    }
    if (state.tool === "rectangle" && type === "down") {
        const pixels = setPencil(state.pixels, payload)
        return {
            startPoint: payload,
            pixels,
        }
    }
    if (state.tool === "rectangle" && type === "drag") {
        if (!state.startPoint) { return }

        const preview = setRectangle(createBuffer(width, height), state.startPoint, payload, 1)
        return {
            preview,
        }
    }
    if (state.tool === "rectangle" && type === "up") {
        if (!state.startPoint) { return }
        const pixels = setRectangle(state.pixels, state.startPoint, payload, 1)
        return {
            pixels,
            startPoint: null,
        }
    }
    if (state.tool === "elipse" && type === "down") {
        return {
            startPoint: payload,
        }
    }
    if (state.tool === "elipse" && type === "drag") {
        if (!state.startPoint) { return }

        const preview = setElipse(createBuffer(width, height), state.startPoint, payload, 1)
        return {
            preview,
        }
    }
    if (state.tool === "elipse" && type === "up") {
        if (!state.startPoint) { return }
        const pixels = setElipse(state.pixels, state.startPoint, payload, 1)
        return {
            pixels,
            startPoint: null,
        }
    }
    if (state.tool === "bucket" && type === "down") {
        const pixels = setFill(state.pixels, payload, state.pattern)
        return {
            pixels
        }
    }
    if (type === "up") {
        return { lastPoint: null }
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
        return (
            <div className="App">
                <Canvas pixels={composite(this.state.pixels, this.state.preview)}
                    dispatch={this.dispatch} />
                <Flex>
                    <Tools selected={this.state.tool}
                        dispatch={this.dispatch} />
                    <Brushes selected={this.state.brush}
                        dispatch={this.dispatch} />
                    <Patterns selected={this.state.pattern}
                        dispatch={this.dispatch} />
                </Flex>
            </div>
        )
    }
}

export default App
