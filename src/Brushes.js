import React from "react"
import styled from "styled-components"
import Icon from "./Icon"

const BrushButton = styled.button`
    appearance: none;
    display: block;
    width: 40px;
    height: 40px;
    margin: 0;
    background-color: white;
    border-radius: none;
    border: ${({ selected }) =>  selected ? "1px solid black" : "1px solid white"};
`

export default function Brushes ({ selected, dispatch, scale, brushes }) {
    return (
        <div>
            <h3>brushes</h3>
            <ul>{brushes.map((brush,i) => (
                <li key={i}>
                    <BrushButton selected={selected === i}
                        onClick={() => dispatch("selectBrush", i)}>
                        <Icon pixels={brush} scale={scale} />
                    </BrushButton>
                </li>
            ))}</ul>
        </div>
    )
}
