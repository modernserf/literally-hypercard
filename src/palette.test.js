import { createFillPattern, parseFillPattern } from "./palette"

it("roundtrips foreground & background", () => {
    const fill = createFillPattern(0, { foreground: 0, background: 1 })
    expect(parseFillPattern(fill)).toEqual({
        foreground: 0,
        background: 1,
        pattern: 0,
        roll: { up: 0, down: 0, left: 0, right: 0 }
    })
})

it("roundtrips rolls", () => {
    const fill = createFillPattern(0, { foreground: 1, background: 0, roll: { left: 1, up: 1 } })
    expect(parseFillPattern(fill)).toEqual({
        foreground: 1,
        background: 0,
        pattern: 0,
        roll: { up: 1, down: 0, left: 1, right: 0 }
    })

    const fill2 = createFillPattern(0, { foreground: 1, background: 0, roll: { down: 1, right: 1 } })
    expect(parseFillPattern(fill2)).toEqual({
        foreground: 1,
        background: 0,
        pattern: 0,
        roll: { up: 0, down: 1, left: 0, right: 1 }
    })
})

it("clears rolls", () => {
    const fill = createFillPattern(0, { foreground: 1, background: 0, roll: { left: 1, up: 1 } })
    const nextFill = createFillPattern(fill, { roll: { right: 1} })
    expect(parseFillPattern(nextFill)).toEqual({
        foreground: 1,
        background: 0,
        pattern: 0,
        roll: { up: 0, down: 0, left: 0, right: 1 }
    })
})

it("roundtrips color cycles", () => {
    const fill = createFillPattern(0, { foreground: 1, background: 0, colors: [2,3,0] })
    expect(parseFillPattern(fill)).toEqual({
        foreground: 1,
        background: 0,
        pattern: 0,
        colors: [2,3,0],
    })
})
