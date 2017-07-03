import React from "react"
import styled from "styled-components"
import { parseFillPattern } from "./palette"
import { formatValue } from "./Color"

const ColorButton = styled.button`
    appearance: none;
    border: ${({selected}) => selected ? "2px solid black" : "2px solid #ccc"};
    margin: 4px;
    width: 32px;
    height: 16px;
`

export default function Animation ({ fill, palette, dispatch }) {
    const { roll, colors, patterns, foreground, background } = parseFillPattern(fill)

    return (
        <div>
            <h3>animations</h3>
            <div>
                <button onClick={() => dispatch("setRoll", {})}>roll</button>
                {roll && <div>
                    <button onClick={() => dispatch("setRoll", {...roll, left: !roll.left})}>⬅️</button>
                    <button onClick={() => dispatch("setRoll", {...roll, right: !roll.right})}>➡️</button>
                    <button onClick={() => dispatch("setRoll", {...roll, up: !roll.up})}>⬆️</button>
                    <button onClick={() => dispatch("setRoll", {...roll, down: !roll.down})}>⬇️</button>
                </div>}
            </div>

            <div>
                <button onClick={() => dispatch("setColorCycle", [background, background, background])}>colors</button>
                {colors && <div>
                    <div>{palette.colors.map((color, i) => i !== foreground && (
                        <ColorButton key={i} selected={i === colors[0]}
                            style={{ backgroundColor: formatValue(color) }}
                            onClick={() => dispatch("setColorCycle", [i, colors[1], colors[2]])} />
                    ))}</div>
                    <div>{palette.colors.map((color, i) => (
                        <ColorButton key={i} selected={i === colors[1]}
                            style={{ backgroundColor: formatValue(color) }}
                            onClick={() => dispatch("setColorCycle", [colors[0], i, colors[2]])} />
                    ))}</div>
                    <div>{palette.colors.map((color, i) => (
                        <ColorButton key={i} selected={i === colors[2]}
                            style={{ backgroundColor: formatValue(color) }}
                            onClick={() => dispatch("setColorCycle", [colors[0], colors[1], i])} />
                    ))}</div>
                </div>}
            </div>

            <div>
                <button onClick={() => dispatch("setPatternCycle", [0,2])}>
                    patterns
                </button>
                {!!patterns && <div>
                    <div>
                        <input type="range" min={0} max={7} value={patterns[0]}
                            onChange={(e) => dispatch("setPatternCycle", [Number(e.target.value), patterns[1]])}/>
                        <input type="range" min={0} max={7} value={patterns[1]}
                            onChange={(e) => dispatch("setPatternCycle", [patterns[0], Number(e.target.value)])}/>
                    </div>
                </div>}
            </div>
        </div>
    )
}
