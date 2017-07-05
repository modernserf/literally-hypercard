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

function fillPattern (value, width, height) {
    const buf = createBuffer(width, height)
    fillBuffer(buf, value)
    return buf
}

export default function Patterns ({ dispatch, palette, selected, scale }) {
    return (
        <div>
            <h3>patterns</h3>
            <Grid>{palette.getPatterns(selected).map((fill) => (
                <li key={fill}>
                    <PatternButton selected={selected === fill}
                        onClick={() => dispatch("setFill", fill)}>
                        <Icon pixels={fillPattern(fill, 16, 16)}
                            palette={palette}
                            scale={scale}/>
                    </PatternButton>
                </li>
            ))}</Grid>
        </div>
    )
}
