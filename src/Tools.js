import React from "react"
import styled from "styled-components"

const Grid = styled.ul`
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-column-gap: 4px;
    grid-row-gap: 4px;
`

const Button = styled.button`
    appearance: none;
    display: block;
    width: 100%;
    padding: 4px;
    border: 1px solid black;
    color: ${({ active }) => active ? "white" : "black"};
    background-color: ${({ active }) => active ? "black" : "white"};
`

export default function Tools ({ dispatch, tools, selected }) {
    return (
        <div>
            <h3>tools</h3>
            <Grid>{tools.map((tool) => (
                <li key={tool}>
                    <Button active={selected === tool}
                        onClick={() => dispatch("selectTool", tool)}>
                        {tool}
                    </Button>
                </li>
            ))}</Grid>
        </div>
    )
}
