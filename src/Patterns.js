import React from "react"
import styled from "styled-components"
import Icon from "./Icon"
import { createBuffer, fillBuffer } from "./buffer"

const Grid = styled.ul`
    display: grid;
    justify-content: start;
    grid-template-columns: auto auto auto auto;
    grid-gap: 4px;
`

const PatternButton = styled.button`
    appearance: none;
    display: block;
    padding: 1px;
    margin: 0;
    width: 100%;
    height: 100%;
    background-color: white;
    border-radius: none;
    border: ${({ selected }) =>  selected ? "1px solid black" : "1px solid #ccc"};
    line-height: 0;
`

function fillPattern (value, width, height) {
    const buf = createBuffer(width, height)
    fillBuffer(buf, value)
    return buf
}

export default function Patterns ({ selected, dispatch, patterns, scale }) {
    return (
        <div>
            <h3>patterns</h3>
            <Grid>{patterns.map((pattern, i) => (
                <li key={i}>
                    <PatternButton selected={selected === i + 1}
                        onClick={() => dispatch("selectPattern", i + 1)}>
                        <Icon pixels={fillPattern(i + 1, 16, 16)}
                            patterns={patterns}
                            scale={scale}/>
                    </PatternButton>
                </li>
            ))}</Grid>
        </div>
    )
}
