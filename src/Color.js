import React from "react"
import styled from "styled-components"
import {colorToHex} from "./palette"


const ColorGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(4, auto);
    grid-gap: 4px;
`

const Label = styled.div`
    grid-column: 1 / 5;
    font-weight: bold;
    font-size: 12px;
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

function Range ({ onChange, ...props }) {
    return (
        <input type="range"
            {...props}
            onChange={(e) => onChange(Number(e.target.value))} />
    )
}

export default class Color extends React.Component {
    state = { selectedEditColor: 0 }
    render () {
        const { fill, stroke, dispatch, colors } = this.props
        const { selectedEditColor } = this.state
        const hexColors = colors.map(colorToHex)

        return (
            <div>
                <h3>colors</h3>
                <ColorGrid>
                    <Label>Stroke</Label>
                    {hexColors.map((color, i) => (
                        <div key={i}>
                            <Button active={stroke === i}
                                onClick={() => dispatch("setStroke", i)}>
                                <ColorBlock style={{ backgroundColor: color }} />
                            </Button>
                        </div>
                    ))}
                    <Label>Fill</Label>
                    {hexColors.map((color, i) => (
                        <div key={i}>
                            <Button active={fill === i}
                                onClick={() => dispatch("setFill", i)}>
                                <ColorBlock style={{ backgroundColor: color }} />
                            </Button>
                        </div>
                    ))}
                </ColorGrid>
                <details>
                    <summary>Edit Colors</summary>
                    <div>
                        <ColorGrid>
                            {hexColors.map((color, i) => (
                                <Button key={i} active={selectedEditColor === i}
                                    onClick={() => this.setState({ selectedEditColor: i })}>
                                    <ColorBlock style={{ backgroundColor: color }} />
                                </Button>
                            ))}
                        </ColorGrid>
                    </div>
                    {["r","g","b"].map((id) => (
                        <div key={id}>
                            {id}
                            <Range value={colors[selectedEditColor][id]}
                                min={0} max={0xFF} step={0x33}
                                onChange={(value) => {
                                    dispatch("setColorValue", {
                                        index: selectedEditColor,
                                        color: {...colors[selectedEditColor], [id]: value }
                                    })
                                }}/>
                        </div>
                    ))}


                </details>
            </div>
        )
    }
}
