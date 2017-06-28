import PropTypes from "prop-types"
import React, { Component } from "react"
import "./App.css"

const width = 512
const height = 342
const scale = 1
const px = 1 << scale

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
        this.ctx.fillRect(0,0, width, height)

        this.ctx.fillStyle = "black"
        for (let y = 0; y < height; y++) {
            for(let x = 0; x < width; x++) {
                if (this.props.pixels[y * width + x]) {
                    this.ctx.fillRect(x << scale,y << scale, px,px)
                }
            }
        }
        requestAnimationFrame(this.renderCanvas)
    }
    getIndex = (e) => {
        const { top, left } = e.target.getBoundingClientRect()
        const x = e.clientX - left
        const y = e.clientY - top
        return (y >> scale) * width + (x >> scale)
    }
    onMouseDown = (e) => {
        this.setState({ mouseDown: true })
        this.props.dispatch("down", this.getIndex(e))
    }
    onMouseMove = (e) => {
        const msg = this.state.mouseDown ? "drag" : "move"
        this.props.dispatch(msg, this.getIndex(e))
    }
    onMouseUp = (e) => {
        this.setState({ mouseDown: false })
        this.props.dispatch("up", this.getIndex(e))
    }
    render () {
        return (
            <canvas ref={this.initRef}
                width={width << scale} height={height << scale}
                onMouseDown={this.onMouseDown}
                onMouseUp={this.onMouseUp}
                onMouseMove={this.onMouseMove}
            />
        )
    }
}

const tools = ["pencil", "brush"]

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

function setBrush (state, i) {
    const { x, y, pattern } = brushes[state.brush]
    const px = state.pixels.slice(0)
    const offset = i + x + (width * y)
    for (let _y = 0; _y < pattern.length; _y++) {
        for (let _x = 0; _x < pattern[_y].length; _x++) {
            if (pattern[_y][_x]) {
                px[offset + _y * width + _x] = 1
            }
        }
    }
    return px
}


function reducer (state, type, payload) {
    if (type === "selectTool") {
        return { tool: payload }
    }
    if (type === "selectBrush") {
        return { brush: payload }
    }
    if (state.tool === "pencil" && (type === "down" || type === "drag")) {
        const px = state.pixels.slice(0)
        px[payload] = 1
        return { pixels: px }
    }
    if (state.tool === "brush" && (type === "down" || type === "drag")) {
        const px = setBrush(state, payload)
        return { pixels: px }
    }
}

class App extends Component {
    state = {
        tool: "pencil",
        brush: 3,
        pixels: Array(width * height).fill(0),
    }
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
