import React from "react"
import Canvas from "./Canvas"
import styled from "styled-components"
import { createPattern } from "./buffer"
import { genPattern } from "./pattern"

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
    return (
        <div>
            <h3>Preview</h3>
            <Canvas pixels={genPattern(pattern)}
                dispatch={() => {}}
                scale={4} />
            <h3>Source</h3>
            <Canvas pixels={createPattern(pattern.pixels)}
                dispatch={() => {}}
                scale={4} />
            <div>{params.map((param) => (
                <div key={param.key}>
                    <Label>{param.label}</Label>
                    <Range value={param.exp ? fastLog(pattern[param.key]) : pattern[param.key]}
                        min={param.min} max={param.max}
                        onChange={updateParam(param.key, param.exp)}/>
                </div>
            ))}
            </div>
            <button>Invert</button>
        </div>
    )
}

export default PatternEditor
