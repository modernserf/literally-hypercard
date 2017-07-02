import React, { Component } from "react"
import styled from "styled-components"
import "./App.css"
import { colors, tools, editActions } from "./config"
import { brushes, patterns } from "./resources"
import { getPixel, createBuffer, copy } from "./buffer"
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
        // TODO: what _should_ pencil do?
        const value = getPixel(state.pixels, payload.x, payload.y) ?
            colors.white :
            colors.black
        return {
            lastPoint: payload,
            pencilValue: value,
            undoBuffer: state.pixels,
            pixels: drawPencil(copy(state.pixels), payload, null, value)
        }
    }
    if (state.tool === "pencil" && type === "drag") {
        return {
            lastPoint: payload,
            pixels: drawPencil(state.pixels, state.lastPoint, payload, state.pencilValue),
        }
    }

    if (state.tool === "brush" && type === "down") {
        return {
            lastPoint: payload,
            undoBuffer: state.pixels,
            pixels: drawBrush(copy(state.pixels), payload, null, brush, state.pattern)
        }
    }
    if (state.tool === "brush" && type === "drag") {
        return {
            lastPoint: payload,
            pixels: drawBrush(state.pixels, state.lastPoint, payload, brush, state.pattern)
        }
    }

    if (state.tool === "eraser" && type === "down") {
        return {
            lastPoint: payload,
            undoBuffer: state.pixels,
            pixels: erase(copy(state.pixels), payload, null, brush)
        }
    }
    if (state.tool === "eraser" && type === "drag") {
        return {
            lastPoint: payload,
            pixels: erase(state.pixels, state.lastPoint, payload, brush)
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
            pixels: drawLine(copy(state.undoBuffer), state.startPoint, payload, brush)
        }
    }

    if (state.tool === "rectangle" && state.startPoint && type === "drag") {
        return {
            pixels: setRectangle(copy(state.undoBuffer), state.startPoint, payload, state.fillShapes && state.pattern)
        }
    }

    if (state.tool === "ellipse" && state.startPoint && type === "drag") {
        return {
            pixels: setEllipse(copy(state.undoBuffer), state.startPoint, payload, state.fillShapes && state.pattern)
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
            pixels: setFill(copy(state.pixels), payload, state.pattern)
        }
    }
}

const Flex = styled.div`
    display: flex;
    .right {
        margin-left: 1em;
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
        const { pixels, tool, brush, pattern, scale } = this.state

        return (
            <Flex>
                <div>
                    <Canvas pixels={pixels}
                        patterns={patterns}
                        dispatch={this.dispatch}
                        scale={scale} />
                </div>
                <div className="right">
                    <Tools selected={tool}
                        dispatch={this.dispatch}
                        tools={tools}/>
                    <Brushes selected={brush}
                        dispatch={this.dispatch}
                        scale={scale}
                        brushes={brushes}/>
                    <Patterns selected={pattern}
                        dispatch={this.dispatch}
                        patterns={patterns}
                        scale={scale}/>
                    <EditActions dispatch={this.dispatch} />
                    <div>
                        <h3>fill shapes</h3>
                        <button onClick={() => this.dispatch("toggleFillShapes")}>
                            {this.state.fillShapes ? "filled" : "empty"}
                        </button>
                    </div>
                </div>
            </Flex>
        )
    }
}

export default App
