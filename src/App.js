import React, { Component } from "react"
import styled from "styled-components"
import localForage from "localforage"
import debounce from "debounce"
import "./App.css"
import { tools, editActions } from "./config"
import { brushes } from "./resources"
import Color  from "./Color"
import Patterns from "./Patterns"
import Canvas from "./Canvas"
import Brushes from "./Brushes"
import Tools from "./Tools"
import PatternEditor from "./PatternEditor"
import { reducer, initState } from "./state"

const stateKey = "literally-hypercard/v2"

function serialize (state) {
    return state
}

function deserialize (state) {
    return {
        ...state,
        empty: false,
    }
}


const Flex = styled.div`
    display: flex;
    flex-wrap: wrap;
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
    state = { empty: true }
    constructor () {
        super()
        localForage.getItem(stateKey).then((state) => {
            this.setState(state ? deserialize(state) : initState)
        })
    }
    saveState = debounce(() => {
        localForage.setItem(stateKey, serialize(this.state))
    }, 1000)
    dispatch = (type, payload) => {
        this.setState((state) => reducer(state, type, payload) || {})
        this.saveState()
    }
    render() {
        if (this.state.empty) { return null }
        const { patterns, pixels, tool, brush, fill, stroke, scale, colors, pattern } = this.state
        return (
            <Flex>
                <div>
                    <div>
                        <Canvas pixels={pixels}
                            colors={colors}
                            dispatch={this.dispatch}
                            scale={scale} />
                    </div>
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
                    <Color fill={fill} stroke={stroke}
                        dispatch={this.dispatch}
                        colors={colors} />
                    <Patterns selected={pattern}
                        dispatch={this.dispatch}
                        patterns={patterns}
                        scale={scale}/>
                </div>
                <div className="right">
                    <PatternEditor id={pattern}
                        pattern={patterns[pattern]}
                        dispatch={this.dispatch} />
                </div>
            </Flex>
        )
    }
}

export default App
