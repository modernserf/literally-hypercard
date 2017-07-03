import React from "react"
import styled from "styled-components"
import {parseFillPattern} from "./palette"

const Flex = styled.div`
    display: flex;
`

function hex (num) {
    return num.toString(16).padStart(2, "0")
}

export function formatValue (obj) {
    return `#${hex(obj.r)}${hex(obj.g)}${hex(obj.b)}`
}

export function unformatValue (str) {
    const num = Number(str.replace("#","0x"))
    return {
        r: (num & 0xFF0000) >> 16,
        g: (num & 0x00FF00) >> 8,
        b: (num & 0x0000FF),
    }
}

function ColorPicker ({ value, onChange }) {
    return (
        <input type="color" value={formatValue(value)}
            onChange={(e) => onChange(unformatValue(e.target.value))} />
    )
}


export default function Color ({ fill, dispatch, palette }) {
    const { foreground, background } = parseFillPattern(fill)
    return (
        <div>
            <h3>colors</h3>
            <Flex>{palette.colors.map((color, i) => (
                <div key={i}>
                    <div>
                        {i === foreground ? (
                            <button onClick={() => dispatch("selectColors", {
                                background: foreground,
                                foreground: background,
                            })}>
                                fg
                            </button>
                        ) : i === background ? (
                            <button onClick={() => dispatch("selectColors", {
                                background: foreground,
                                foreground: background
                            })}>
                                bg
                            </button>
                        ) : (
                            <button onClick={() => dispatch("selectColors", {
                                foreground: i,
                                background: background,
                            })}>
                                x
                            </button>
                        )}
                    </div>
                    <ColorPicker value={color}
                        onChange={(value) => dispatch("setColorValue", { color: value, index: i})}/>
                </div>
            ))}</Flex>
        </div>
    )
}
