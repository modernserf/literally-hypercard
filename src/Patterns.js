import React from "react"
import styled from "styled-components"
import Icon from "./Icon"
import Canvas from "./Canvas"
import { createPattern as createPatternBuffer } from "./buffer"
import {
    createPattern,
    invert, togglePixel,
    rotateLeft, rotateRight,
    flipVertical, flipHorizontal,
    fillPattern,
} from "./pattern"

const Flex = styled.div`
    display: flex;
    .right {
        padding-left: 8px;
    }
`

const Grid = styled.ul`
    display: grid;
    justify-content: start;
    grid-template-columns: repeat(8, auto);
    grid-gap: 4px;
`

const PatternButton = styled.button`
    appearance: none;
    display: block;
    padding: 2px;
    margin: 0;
    width: 100%;
    height: 100%;
    background-color: white;
    border-radius: none;
    border: ${({ selected }) =>  selected ? "2px solid black" : "2px solid #eee"};
    line-height: 0;
    :focus {
        outline: none;
    }
`

const Label = styled.label`
    font-size: 12px;
    display: block;
`

function Range ({ value, onChange, min, max }) {
    return (
        <input type="range"
            value={value} min={min} max={max}
            onChange={(e) => onChange(Number(e.target.value))} />
    )
}

const params = [
    { label: "X Offset", key: "xOffset", min: 0, max: 7 },
    { label: "Y Offset", key: "yOffset", min: 0, max: 7 },
    { label: "X Freq", key: "xFreq", min: 0, max: 3, exp: true },
    { label: "Y Freq", key: "yFreq", min: 0, max: 3, exp: true },
    { label: "Tile", key: "tile", min: -7, max: 7 },
]

function fastLog (value) {
    switch (value) {
    case 1: return 0
    case 2: return 1
    case 4: return 2
    case 8: return 3
    default: return Math.log2(value) | 0
    }
}

function PatternEditor ({ id, pattern, dispatch }) {
    const updateParam = (key, exp) => exp
        ? (value) => {  dispatch("updatePattern", { id, pattern: {...pattern, [key]: (1 << value) } }) }
        : (value) => {  dispatch("updatePattern", { id, pattern: {...pattern, [key]: value } }) }
    const updatePixels = (updater) => () => {
        dispatch("updatePattern", { id, pattern: {...pattern, pixels: updater(pattern.pixels) } })
    }
    const onClick = (type, payload) => {
        if (type === "down") {
            dispatch("updatePattern", { id, pattern: { ...pattern, pixels: togglePixel(pattern.pixels, payload) }})
        }
    }
    return (
        <div>
            <Flex>
                <div>
                    <h3>Preview</h3>
                    <Canvas pixels={createPattern(pattern)}
                        dispatch={() => {}}
                        scale={4} />
                </div>
                <div className="right">
                    <h3>Source</h3>
                    <Canvas pixels={createPatternBuffer(pattern.pixels)}
                        dispatch={onClick}
                        scale={4} />
                </div>
            </Flex>
            <Flex>
                <div>{params.map((param) => (
                    <div key={param.key}>
                        <Label>{param.label}</Label>
                        <Range value={param.exp ? fastLog(pattern[param.key]) : pattern[param.key]}
                            min={param.min} max={param.max}
                            onChange={updateParam(param.key, param.exp)}/>
                    </div>
                ))}
                </div>
                <div className="right">
                    <button onClick={updatePixels(invert)}>Invert</button>
                    <div>
                        <button onClick={updatePixels(rotateLeft)}>{"<-"}</button>
                        <button onClick={updatePixels(rotateRight)}>{"->"}</button>
                    </div>
                    <div>
                        <button onClick={updatePixels(flipHorizontal)}>flip horizontal</button>
                    </div>
                    <div>
                        <button onClick={updatePixels(flipVertical)}>flip vertical</button>
                    </div>
                </div>
            </Flex>

        </div>
    )
}

export default function Patterns ({ dispatch, patterns, selected, scale }) {
    return (
        <div>
            <h3>patterns</h3>
            <Grid>{patterns.map((pattern, i) => (
                <li key={i}>
                    <PatternButton selected={selected === i}
                        onClick={() => dispatch("setPattern", i)}>
                        <Icon pixels={fillPattern(pattern, 16, 16)}
                            scale={scale}/>
                    </PatternButton>
                </li>
            ))}</Grid>
            <details>
                <summary>Edit Patterns</summary>
                <PatternEditor id={selected}
                    pattern={patterns[selected]}
                    dispatch={dispatch} />
            </details>
        </div>
    )
}
