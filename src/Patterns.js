import React from "react"
import styled from "styled-components"
import Icon from "./Icon"

const PatternButton = styled.button`
    appearance: none;
    display: block;
    padding: 1px;
    margin: 0;
    background-color: white;
    border-radius: none;
    border: ${({ selected }) =>  selected ? "1px solid black" : "1px solid #ccc"};
    line-height: 0;
`

export default function Patterns ({ selected, dispatch, patterns, scale }) {
    return (
        <div>
            <h3>patterns</h3>
            <ul>{patterns.map((pattern,i) => (
                <li key={i}>
                    <PatternButton selected={selected === i + 1}
                        onClick={() => dispatch("selectPattern", i + 1)}>
                        <div>
                            <Icon pixels={pattern} scale={scale} />
                            <Icon pixels={pattern} scale={scale} />
                            <Icon pixels={pattern} scale={scale} />
                            <Icon pixels={pattern} scale={scale} />
                        </div>
                        <div>
                            <Icon pixels={pattern} scale={scale} />
                            <Icon pixels={pattern} scale={scale} />
                            <Icon pixels={pattern} scale={scale} />
                            <Icon pixels={pattern} scale={scale} />
                        </div>
                    </PatternButton>
                </li>
            ))}</ul>
        </div>
    )
}
