import React from "react"
import styled from "styled-components"

const Button = styled.button`
    appearance: none;
    padding: 4px;
    margin: 2px 0;
    border: 1px solid black;
    color: ${({ active }) => active ? "white" : "black"};
    background-color: ${({ active }) => active ? "black" : "white"};
`

export default function Tools ({ dispatch, tools, selected }) {
    return (
        <div>
            <h3>tools</h3>
            <ul>{tools.map((tool) => (
                <li key={tool}>
                    <Button active={selected === tool}
                        onClick={() => dispatch("selectTool", tool)}>
                        {tool}
                    </Button>
                </li>
            ))}</ul>
        </div>
    )
}
