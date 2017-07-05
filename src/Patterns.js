import React from "react"
import styled from "styled-components"
import Icon from "./Icon"
import { createBuffer, setPixel, getPixel } from "./buffer"

const Grid = styled.ul`
    display: grid;
    justify-content: start;
    grid-template-columns: auto auto auto auto;
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
// TODO
function fillPattern (pattern, width, height) {
    const buf = createBuffer(width, height)
    for (let y = 0; y < width; y++) {
        for (let x = 0; x < height; x++) {
            setPixel(buf, x, y, getPixel(pattern, x & 7, y & 7))
        }
    }
    return buf
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
        </div>
    )
}
