import React from "react"
import styled from "styled-components"
import {colorToHex, hexToColor} from "./palette"

const Flex = styled.div`
    display: flex;
`

const Button = styled.button`
    appearance: none;
    display: block;
    background-color: white;
    padding: 2px;
    width: 100%;
    border: ${({ active }) => active ? "2px solid black" : "2px solid #ccc" };
    &:focus {
        outline: none;
    }
`

const ColorBlock = styled.div`
    height: 16px;
    width: 100%;
`

function ColorPicker ({ value, onChange }) {
    return (
        <input type="color" value={colorToHex(value)}
            onChange={(e) => onChange(hexToColor(e.target.value))} />
    )
}

export default function Color ({ fill, stroke, dispatch, colors }) {
    return (
        <div>
            <h3>colors</h3>
            <Flex>{colors.map((color, i) => {
                const hex = colorToHex(color)
                return (
                    <div key={i}>
                        <Button active={stroke === i}
                            onClick={() => dispatch("setStroke", i)}>
                            <ColorBlock style={{ backgroundColor: hex }} />
                        </Button>
                        <Button active={fill === i}
                            onClick={() => dispatch("setFill", i)}>
                            <ColorBlock style={{ backgroundColor: hex }} />
                        </Button>
                        <ColorPicker value={color}
                            onChange={(value) => dispatch("setColorValue", { color: value, index: i})}/>
                    </div>
                )
            })}</Flex>
        </div>
    )
}
