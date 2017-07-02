import React, { Component } from "react"
import styled from "styled-components"
import "./App.css"
import { colors, tools, editActions } from "./config"
import { brushes, patterns } from "./resources"
import { getPixel, createBuffer, composite } from "./buffer"
import Patterns from "./Patterns"
import Canvas from "./Canvas"
import Brushes from "./Brushes"
import Tools from "./Tools"

import { drawBrush, drawPencil, setRectangle, erase, drawLine, setEllipse, setFill } from "./draw"

const size = 256

const initState = {
    width: size,
    height: size,
    scale: 1,
    tool: "brush",
    brush: 3,
    pattern: 2,
    undoBuffer: createBuffer(size, size),
    pixels: createBuffer(size, size),
    startPoint: null,
    lastPoint: null,
    fillShapes: true,
}

function reducer (state, type, payload) {
    const brush = brushes[state.brush]

    // set tools
    if (type === "selectTool") {
        return {
            tool: payload,
        }
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

    if (type === "clear") {
        return {
            undoBuffer: state.pixels,
            pixels: createBuffer(state.width, state.height),
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
            preview: drawBrush(createBuffer(state.width, state.height), payload, null, brush, state.pattern)
        }
    }
    if (state.tool === "brush" && type === "drag") {
        return {
            lastPoint: payload,
            preview: drawBrush(state.preview, state.lastPoint, payload, brush, state.pattern)
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
            preview: drawLine(createBuffer(state.width, state.height), state.startPoint, payload, brush)
        }
    }

    if (state.tool === "rectangle" && state.startPoint && type === "drag") {
        const preview = setRectangle(
            createBuffer(state.width, state.height),
            state.startPoint,
            payload,
            state.fillShapes && state.pattern)
        return {
            preview,
        }
    }

    if (state.tool === "ellipse" &&  state.startPoint && type === "drag") {
        const preview = setEllipse(
            createBuffer(state.width, state.height),
            state.startPoint,
            payload,
            state.fillShapes && state.pattern)
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
        const filled = setFill(state.pixels, payload, state.pattern)
        return {
            undoBuffer: state.pixels,
            pixels: composite(state.pixels, filled)
        }
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
        ].reduce(composite)

        return (
            <div className="App">
                <Canvas pixels={pixels}
                    patterns={patterns}
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
