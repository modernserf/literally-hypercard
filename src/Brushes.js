import React from "react"
import styled from "styled-components"
import Icon from "./Icon"

const Grid = styled.ul`
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr;
    grid-column-gap: 4px;
    grid-row-gap: 4px;
`


const BrushButton = styled.button`
    appearance: none;
    display: block;
    width: 100%;
    height: 100%;
    margin: 0;
    background-color: white;
    border-radius: none;
    border: ${({ selected }) =>  selected ? "1px solid black" : "1px solid white"};
`

export default function Brushes ({ selected, dispatch, scale, brushes }) {
    return (
        <div>
            <h3>brushes</h3>
            <Grid>{brushes.map((brush,i) => (
                <li key={i}>
                    <BrushButton selected={selected === i}
                        onClick={() => dispatch("selectBrush", i)}>
                        <Icon pixels={brush} scale={scale} />
                    </BrushButton>
                </li>
            ))}</Grid>
        </div>
    )
}
