import PropTypes from "prop-types"
import bresenham from "bresenham"
import React, { Component } from "react"
import styled from "styled-components"
import "./App.css"
import floodFillScanline from "./floodFillScanline"

const width = 256
const height = 256
const scale = 1

class Icon extends Component {
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
        const height = this.props.pixels.length
        const width = this.props.pixels[0].length
        this.ctx.fillStyle = "white"
        this.ctx.fillRect(0,0, width << scale, height << scale)

        this.ctx.fillStyle = "black"
        for (let y = 0; y < height; y++) {
            for(let x = 0; x < width; x++) {
                if (this.props.pixels[y][x] === 1) {
                    this.ctx.fillRect(
                        x << scale,
                        y << scale,
                        1 << scale,
                        1 << scale)
                }
            }
        }
    }
    render () {
        const height = this.props.pixels.length
        const width = this.props.pixels[0].length

        return (
            <canvas style={{display: "inline-block"}} ref={this.initRef}
                width={width << scale} height={height << scale}
            />
        )
    }
}

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
                if (this.props.pixels[y][x] === 1) {
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
                className="main-canvas"
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
    { x: -1, y: -1, pattern: [
        [1,1,1],
        [1,1,1],
        [1,1,1]] },
    { x: -1, y: -1, pattern: [
        [0,1,1,0],
        [1,1,1,1],
        [1,1,1,1],
        [0,1,1,0]] },
    { x: -3, y: -3, pattern: [
        [0,0,1,1,1,0,0],
        [0,1,1,1,1,1,0],
        [1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1],
        [0,1,1,1,1,1,0],
        [0,0,1,1,1,0,0],
    ] },
    { x: -5, y: -5, pattern: [
        [0,0,0,0,1,1,1,0,0,0,0],
        [0,0,1,1,1,1,1,1,1,0,0],
        [0,1,1,1,1,1,1,1,1,1,0],
        [0,1,1,1,1,1,1,1,1,1,0],
        [1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1],
        [0,1,1,1,1,1,1,1,1,1,0],
        [0,1,1,1,1,1,1,1,1,1,0],
        [0,0,1,1,1,1,1,1,1,0,0],
        [0,0,0,0,1,1,1,0,0,0,0],
    ] },
]

const BrushButton = styled.button`
    appearance: none;
    display: block;
    width: 40px;
    height: 40px;
    margin: 0;
    background-color: white;
    border-radius: none;
    border: ${({ selected }) =>  selected ? "1px solid black" : "1px solid white"};
`

function Brushes ({ selected, dispatch }) {
    return (
        <div>
            <h3>brushes</h3>
            <ul>{brushes.map(({ pattern },i) => (
                <li key={i}>
                    <BrushButton selected={selected === i}
                        onClick={() => dispatch("selectBrush", i)}>
                        <Icon pixels={pattern} />
                    </BrushButton>
                </li>
            ))}</ul>
        </div>
    )
}

const patterns = [
    [
        [-1,-1,-1,-1],
        [-1,-1,-1,-1],
        [-1,-1,-1,-1],
        [-1,-1,-1,-1],
    ],
    [
        [1,1,1,1],
        [1,1,1,1],
        [1,1,1,1],
        [1,1,1,1],
    ],
    [
        [-1,1,-1,1],
        [1,-1,1,-1],
        [-1,1,-1,1],
        [1,-1,1,-1],
    ],
    [
        [-1,1,1,1],
        [1,1,1,1],
        [1,1,-1,1],
        [1,1,1,1],
    ],
    [
        [-1,-1,1,-1],
        [-1,-1,-1,-1],
        [1,-1,-1,-1],
        [-1,-1,-1,-1],
    ]
]

const PatternButton = styled.button`
    appearance: none;
    display: block;
    padding: 1px;
    margin: 0;
    background-color: white;
    border-radius: none;
    border: ${({ selected }) =>  selected ? "1px solid black" : "1px solid #ccc"};
    line-height: 0;
`

function Patterns ({ selected, dispatch }) {
    return (
        <div>
            <h3>patterns</h3>
            <ul>{patterns.map((pattern,i) => (
                <li key={i}>
                    <PatternButton selected={selected === i}
                        onClick={() => dispatch("selectPattern", i)}>
                        <div>
                            <Icon pixels={pattern} />
                            <Icon pixels={pattern} />
                            <Icon pixels={pattern} />
                            <Icon pixels={pattern} />
                        </div>
                        <div>
                            <Icon pixels={pattern} />
                            <Icon pixels={pattern} />
                            <Icon pixels={pattern} />
                            <Icon pixels={pattern} />
                        </div>
                    </PatternButton>
                </li>
            ))}</ul>
        </div>
    )
}


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

function setRectangle (buffer, p0, p1, withFill, patternID) {
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
        Array(width).fill(0))
}

function composite (bottom, top) {
    if (!top) { return bottom }
    const out = []
    for (let y = 0; y < height; y++) {
        const line = []
        for (let x = 0; x < width; x++) {
            if (top[y][x] === -1) {
                line.push(0)
            } else {
                line.push(bottom[y][x] | top[y][x])
            }
        }
        out.push(line)
    }
    return out
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

    if (state.preview && type === "up") {
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

    if (state.tool === "select" && type === "down") {
        return {
            startPoint: payload
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
