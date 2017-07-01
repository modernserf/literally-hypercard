import React, { Component } from "react"
import styled from "styled-components"
import "./App.css"
import { colors, tools, editActions } from "./config"
import { brushes, patterns, cycleFill } from "./base-patterns"
import { getPixel, setPixel, createBuffer, composite, translate } from "./buffer"
import Patterns from "./Patterns"
import Canvas from "./Canvas"
import Brushes from "./Brushes"
import Tools from "./Tools"

import { drawBrush, drawPattern, drawPencil, setRectangle, erase, drawLine, setEllipse, setFill } from "./draw"

function order (a, b) {
    return a < b ? [a,b] : [b,a]
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

function createMarquee (selection, p0, p1) {
    const buffer = createBuffer(selection.width, selection.height)
    const [x0, x1] = order(p0.x, p1.x)
    const [y0, y1] = order(p0.y, p1.y)

    for (let x = x0; x <= x1; x++) {
        drawPattern(buffer, cycleFill.topLeft, x, y0)
        drawPattern(buffer, cycleFill.bottomRight, x, y1)
    }

    for (let y = y0; y <= y1; y++) {
        drawPattern(buffer, cycleFill.topLeft, x0, y)
        drawPattern(buffer, cycleFill.bottomRight, x1, y)
    }

    return buffer
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

const size = 128


const initState = {
    width: size,
    height: size,
    scale: 1,
    tool: "brush",
    brush: 3,
    pattern: 1,
    undoBuffer: createBuffer(size, size),
    pixels: createBuffer(size, size),
    startPoint: null,
    lastPoint: null,
    fillShapes: true,
    selection: null,
    selectionMarquee: null,
    clipboard: null,
}

function reducer (state, type, payload) {
    const brush = brushes[state.brush]
    const pattern = patterns[state.pattern]

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

    if (type === "cut" && state.selection) {
        return {
            undoBuffer: state.pixels,
            pixels: composite(state.pixels, blankSelection(state.selection)),
            clipboard: state.selection,
            selection: null,
            preview: null,
        }
    }

    if (type === "copy" && state.selection) {
        return {
            clipboard: state.selection,
        }
    }

    // TODO: paste into selection

    if (type === "paste" && state.selection && state.clipboard) {
        return {
            ...commitSelection(state),
            selection: state.clipboard,
            selectionMarquee: createMarquee(
                state.clipboard,
                { x: 0, y: 0 },
                { x: state.width, y: state.height })
        }
    }

    if (type === "paste" && state.clipboard) {
        return {
            selection: state.clipboard,
            selectionMarquee: createMarquee(
                state.clipboard,
                { x: 0, y: 0 },
                { x: state.width, y: state.height })
        }
    }

    if (type === "clear" && state.selection) {
        return {
            undoBuffer: state.pixels,
            pixels: composite(state.pixels, blankSelection(state.selection)),
            selection: null,
        }
    }

    if (type === "clear") {
        return {
            undoBuffer: state.pixels,
            pixels: createBuffer(state.width, state.height),
        }
    }

    if (type === "select all") {
        const start = { x: 0, y: 0 }
        const end = {x: state.width - 1, y: state.height - 1 }
        const selection = createSelection(state.pixels, start, end)
        const selectionMarquee = createMarquee(selection, start, end)
        return {
            startPoint: null,
            preview: blankSelection(selection),
            selection,
            selectionMarquee
        }
    }

    // note: puts you in select mode
    if (type === "down" && state.selection && !inSelection(state.selection, payload)) {
        return {
            ...commitSelection(state),
            tool: "select",
            startPoint: payload,
        }
    }


    if (type === "toggleFillShapes") {
        return { fillShapes: !state.fillShapes }
    }

    // brushlike tools -- accumulative preview
    if (state.tool === "pencil" && type === "down") {
        const value = getPixel(state.pixels, payload.x, payload.y) === colors.black ?
            colors.white :
            colors.black
        return {
            lastPoint: payload,
            pencilValue: value,
            preview: drawPencil(createBuffer(state.width, state.height), payload, null, value)
        }
    }
    if (state.tool === "pencil" && type === "drag") {
        return {
            lastPoint: payload,
            preview: drawPencil(state.preview, state.lastPoint, payload, state.pencilValue),
        }
    }

    if (state.tool === "brush" && type === "down") {
        return {
            lastPoint: payload,
            preview: drawBrush(createBuffer(state.width, state.height), payload, null, brush, pattern)
        }
    }
    if (state.tool === "brush" && type === "drag") {
        return {
            lastPoint: payload,
            preview: drawBrush(state.preview, state.lastPoint, payload, brush, pattern)
        }
    }

    if (state.tool === "eraser" && type === "down") {
        return {
            lastPoint: payload,
            preview: erase(createBuffer(state.width, state.height), payload, null, brush)
        }
    }
    if (state.tool === "eraser" && type === "drag") {
        return {
            lastPoint: payload,
            preview: erase(state.preview, state.lastPoint, payload, brush)
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
            state.fillShapes && pattern)
        return {
            preview,
        }
    }

    if (state.tool === "ellipse" &&  state.startPoint && type === "drag") {
        const preview = setEllipse(
            createBuffer(state.width, state.height),
            state.startPoint,
            payload,
            state.fillShapes && pattern)
        return {
            preview,
        }
    }

    if (["pencil","brush","eraser","line","rectangle","ellipse"].includes(state.tool) &&
        state.preview && type === "up") {
        return {
            pencilValue: null,
            startPoint: null,
            lastPoint: null,
            undoBuffer: state.pixels,
            pixels: composite(state.pixels, state.preview),
            preview: null,
        }
    }

    if (state.tool === "bucket" && type === "down") {
        const pixels = setFill(state.pixels, payload, pattern)
        return {
            undoBuffer: state.pixels,
            pixels
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
            selectionMarquee: createMarquee(
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


function EditActions ({ dispatch }) {
    return (
        <div>
            <h3>edit</h3>
            <ul>{editActions.map((name) => (
                <li key={name}>
                    <button onClick={() => dispatch(name)}>
                        {name}
                    </button>
                </li>
            ))}
            </ul>
        </div>
    )
}

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
                    <EditActions dispatch={this.dispatch} />
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
