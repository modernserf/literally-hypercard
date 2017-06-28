import PropTypes from "prop-types"
import bresenham from "bresenham"
import React, { Component } from "react"
import "./App.css"

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

const tools = ["pencil", "brush", "eraser"]

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

function setPencil (state, buffer, point) {
    buffer[point.y][point.x] = 1
    return buffer
}

function setBrush (state, buffer, point, fill) {
    const { x: offsetX, y: offsetY, pattern } = brushes[state.brush]
    for (let y = 0; y < pattern.length; y++) {
        for (let x = 0; x < pattern[y].length; x++) {
            const _x = point.x + offsetX + x
            const _y = point.y + offsetY + y
            if (pattern[y][x] && buffer[_y] && _x > 0 && _x < buffer[_y].length) {
                buffer[_y][_x] = fill
            }
        }
    }
    return buffer
}

function createBuffer (width, height) {
    return Array(height).fill(0).map(() =>
        Array(width).fill(0))
}

const initState = {
    tool: "pencil",
    brush: 3,
    pixels: createBuffer(width, height),
    lastPoint: null,
}

function reducer (state, type, payload) {
    if (type === "selectTool") {
        return { tool: payload }
    }
    if (type === "selectBrush") {
        return { brush: payload }
    }
    if (state.tool === "pencil" && type === "down") {
        const px = setPencil(state, state.pixels, payload)
        return {
            lastPoint: payload,
            pixels: px
        }
    }
    if (state.tool === "pencil" && type === "drag") {
        const points = bresenham(state.lastPoint.x, state.lastPoint.y, payload.x, payload.y)
        const px = points.reduce((acc, point) => setPencil(state, acc, point), state.pixels)
        return {
            lastPoint: payload,
            pixels: px
        }
    }
    if (state.tool === "brush" && type === "down") {
        const px = setBrush(state, state.pixels, payload, 1)
        return {
            lastPoint: payload,
            pixels: px,
        }
    }
    if (state.tool === "brush" && type === "drag") {
        const points = bresenham(state.lastPoint.x, state.lastPoint.y, payload.x, payload.y)
        const px = points.reduce((acc, point) => setBrush(state, acc, point, 1), state.pixels)
        return {
            lastPoint: payload,
            pixels: px
        }
    }
    if (state.tool === "eraser" && type === "down") {
        const px = setBrush(state, state.pixels, payload, 0)
        return {
            lastPoint: payload,
            pixels: px,
        }
    }
    if (state.tool === "eraser" && type === "drag") {
        const points = bresenham(state.lastPoint.x, state.lastPoint.y, payload.x, payload.y)
        const px = points.reduce((acc, point) => setBrush(state, acc, point, 0), state.pixels)
        return {
            lastPoint: payload,
            pixels: px
        }
    }
    if (type === "up") {
        return { lastPoint: null }
    }
}

class App extends Component {
    state = initState
    dispatch = (type, payload) => {
        this.setState((state) => reducer(state, type, payload) || {})
    }
    render() {
        return (
            <div className="App">
                <Canvas pixels={this.state.pixels}
                    dispatch={this.dispatch} />
                <Tools selected={this.state.tool}
                    dispatch={this.dispatch} />
                <Brushes selected={this.state.brush}
                    dispatch={this.dispatch} />
            </div>
        )
    }
}

export default App
