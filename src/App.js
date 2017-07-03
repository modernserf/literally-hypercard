import React, { Component } from "react"
import styled from "styled-components"
import "./App.css"
import { colors, tools, editActions } from "./config"
import { brushes, patterns } from "./resources"
import { getPixel, createBuffer, copy, flipHorizontal, flipVertical } from "./buffer"
import Palette, { createFillPattern } from "./palette"
import AnimationControls from "./AnimationControls"
import Color , {unformatValue} from "./Color"
import Patterns from "./Patterns"
import Canvas from "./Canvas"
import Brushes from "./Brushes"
import Tools from "./Tools"

import { drawBrush, drawPencil, setRectangle, erase, drawLine, setEllipse, setFill } from "./draw"

const size = 256

const white = unformatValue("#FFFFFF")
const black = unformatValue("#000000")
const navy = unformatValue("#333366")
const amber = unformatValue("#CC9900")

const initState = {
    width: size,
    height: size,
    scale: 1,
    tool: "brush",
    brush: 6,
    fill: createFillPattern(0, { foreground: 1, background: 0, }),
    undoBuffer: createBuffer(size, size),
    pixels: createBuffer(size, size),
    startPoint: null,
    lastPoint: null,
    fillShapes: true,
    palette: new Palette({
        colors: [white, black, amber, navy],
        patterns,
    })
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
    if (type === "setFill") {
        return {
            fill: payload,
        }
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

    if (type === "selectColors") {
        const { foreground, background } = payload
        return {
            fill: createFillPattern(state.fill, { foreground, background })
        }
    }

    if (type === "setColorValue") {
        const { color, index } = payload

        state.palette.colors[index] = color
        return {
            palette: state.palette,
        }
    }

    if (type === "setRoll") {
        return {
            fill: createFillPattern(state.fill, { roll: payload })
        }
    }

    if (type === "setColorCycle") {
        return {
            fill: createFillPattern(state.fill, { colors: payload })
        }
    }

    if (type === "setPatternCycle") {
        return {
            fill: createFillPattern(state.fill, { patterns: payload })
        }
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
            pixels: drawBrush(copy(state.pixels), payload, null, brush, state.fill)
        }
    }
    if (state.tool === "brush" && type === "drag") {
        return {
            lastPoint: payload,
            pixels: drawBrush(state.pixels, state.lastPoint, payload, brush, state.fill)
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
            pixels: setRectangle(copy(state.undoBuffer), state.startPoint, payload, state.fillShapes && state.fill)
        }
    }

    if (state.tool === "ellipse" && state.startPoint && type === "drag") {
        return {
            pixels: setEllipse(copy(state.undoBuffer), state.startPoint, payload, state.fillShapes && state.fill)
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
            pixels: setFill(copy(state.pixels), payload, state.fill)
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
        const { pixels, tool, brush, fill, scale, palette } = this.state
        return (
            <Flex>
                <div>
                    <Canvas pixels={pixels}
                        patterns={patterns}
                        palette={palette}
                        dispatch={this.dispatch}
                        scale={scale} />
                    <AnimationControls fill={fill}
                        palette={palette}
                        dispatch={this.dispatch} />
                </div>
                <div className="right">
                    <Tools selected={tool}
                        dispatch={this.dispatch}
                        tools={tools}/>
                    <Brushes selected={brush}
                        dispatch={this.dispatch}
                        scale={scale}
                        brushes={brushes}/>
                    <EditActions dispatch={this.dispatch} />
                    <div>
                        <h3>fill shapes</h3>
                        <button onClick={() => this.dispatch("toggleFillShapes")}>
                            {this.state.fillShapes ? "filled" : "empty"}
                        </button>
                    </div>
                </div>
                <div className="right">
                    <Color fill={fill}
                        dispatch={this.dispatch}
                        palette={palette} />
                    <Patterns selected={fill}
                        dispatch={this.dispatch}
                        palette={palette}
                        scale={scale}/>
                </div>
            </Flex>
        )
    }
}

export default App
