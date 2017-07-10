import floodFillScanline from "./floodFillScanline"
import bresenham from "bresenham"
import { getPixel, setPixel, getWidth, getHeight, copy, createBuffer } from "./buffer"

export function drawPencil (buffer, { start, end, fill }) {
    const points = end ? bresenham(start.x, start.y, end.x, end.y) : [start]

    for (let i = 0; i < points.length; i++) {
        setPixel(buffer, points[i].x, points[i].y, fill)
    }
    return buffer
}

export function drawLine (buffer, {start, end, brush, fill}) {
    const points = bresenham(start.x, start.y, end.x, end.y)
    return drawLinePoints(buffer, points, brush, fill)
}

export function drawBrush (buffer, {start, end, brush, fill, pattern}) {
    const points = end ? bresenham(start.x, start.y, end.x, end.y) : [start]
    return drawLinePoints(buffer, points, brush, fill, pattern)
}

export function erase (buffer, {start, end, brush}) {
    const points = end ? bresenham(start.x, start.y, end.x, end.y) : [start]
    return drawLinePoints(buffer, points, brush, 0)
}

export function drawRectangle (buffer, { start, end, isFilled, fill, brush, pattern }) {
    const [x0, x1] = order(start.x, end.x)
    const [y0, y1] = order(start.y, end.y)

    // draw fill
    if (isFilled) {
        for (let y = y0; y <= y1; y++) {
            for (let x = x0; x <= x1; x++) {
                drawPoint(buffer,x,y, null, fill, pattern)
            }
        }
    // draw sides
    } else {
        for (let y = y0; y <= y1; y++) {
            drawPoint(buffer,x0,y, brush, fill, pattern)
            drawPoint(buffer,x1,y, brush, fill, pattern)
        }
        for (let x = x0; x <= x1; x++) {
            drawPoint(buffer,x,y0, brush, fill, pattern)
            drawPoint(buffer,x,y1, brush, fill, pattern)
        }
    }

    return buffer
}

function drawArc (buffer, width, height, xc, yc, xDirection, yDirection, { fill, isFilled, brush, pattern }) {
    const a2 = width * width
    const b2 = height * height
    const fa2 = 4 * a2
    const fb2 = 4 * b2

    /* first half */
    for (let x = 0, y = height, sigma = 2*b2+a2*(1-2*height); b2*x <= a2*y; x++) {
        const px = xc + (x * xDirection)
        const py = yc + (y * yDirection)

        if (isFilled) {
            const [y0, y1] = order(py, yc)
            for (let _y = y0; _y <= y1; _y++) {
                drawPoint(buffer, px, _y, brush, fill, pattern)
            }
        } else {
            drawPoint(buffer, px, py, brush, fill, pattern)
        }

        if (sigma >= 0) {
            sigma += fa2 * (1 - y)
            y--
        }
        sigma += b2 * ((4 * x) + 6)
    }

    /* second half */
    for (let x = width, y = 0, sigma = 2*a2+b2*(1-2*width); a2*y <= b2*x; y++) {
        const px = xc + (x * xDirection)
        const py = yc + (y * yDirection)


        if (isFilled) {
            const [x0, x1] = order(px, xc)
            for (let _x = x0; _x <= x1; _x++) {
                drawPoint(buffer, _x, py, brush, fill, pattern)
            }
        } else {
            drawPoint(buffer, px, py, brush, fill, pattern)
        }

        if (sigma >= 0) {
            sigma += fb2 * (1 - x)
            x--
        }
        sigma += a2 * ((4 * y) + 6)
    }
}

export function drawRoundRect (buffer, params) {
    const { start, end, brush, fill, pattern, isFilled } = params
    const [x0, x1] = order(start.x, end.x)
    const [y0, y1] = order(start.y, end.y)
    const minWidth = (x1 - x0) >> 1
    const minHeight = (y1 - y0) >> 1
    if (!minHeight || !minWidth) { return buffer }

    const width = Math.min(9, minWidth)
    const height = Math.min(9, minHeight)

    drawArc(buffer, width, height, x0 + width, y0 + height, -1, -1, params)
    drawArc(buffer, width, height, x0 + width, y1 - height, -1, 1, params)
    drawArc(buffer, width, height, x1 - width, y0 + height, 1, -1, params)
    drawArc(buffer, width, height, x1 - width, y1 - height, 1, 1, params)

    if (isFilled) {
        for (let y = y0 + height; y <= y1 - height; y++) {
            for (let x = x0; x <= x1; x++) {
                drawPoint(buffer, x, y, brush, fill, pattern)
            }
        }

        for (let x = x0 + width; x <= x1 - width; x++) {
            for (let y = y0 ; y <= y0 + height; y++) {
                drawPoint(buffer, x, y, brush, fill, pattern)
            }
            for (let y = y1 - height; y <= y1; y++) {
                drawPoint(buffer, x, y, brush, fill, pattern)
            }
        }
    } else {
        for (let y = y0 + height; y <= y1 - height; y++) {
            drawPoint(buffer,x0,y, brush, fill, pattern)
            drawPoint(buffer,x1,y, brush, fill, pattern)
        }
        for (let x = x0 + width; x <= x1 - width; x++) {
            drawPoint(buffer,x,y0, brush, fill, pattern)
            drawPoint(buffer,x,y1, brush, fill, pattern)
        }
    }

    return buffer
}

export function drawEllipse (buffer, params) {
    const { start, end } = params
    const [x0, x1] = order(start.x, end.x)
    const [y0, y1] = order(start.y, end.y)
    // radii
    const width = (x1 - x0) >> 1
    const height = (y1 - y0) >> 1
    if (!width || !height) { return buffer }

    const xc = x0 + width
    const yc = y0 + height

    drawArc(buffer, width, height, xc, yc, -1, -1, params)
    drawArc(buffer, width, height, xc, yc, 1, -1, params)
    drawArc(buffer, width, height, xc, yc, -1, 1, params)
    drawArc(buffer, width, height, xc, yc, 1, 1, params)

    return buffer
}

export function drawFill (buffer, { point, fill, pattern }) {
    const width = getWidth(buffer)
    const height = getHeight(buffer)
    const matchColor = getPixel(buffer, point.x, point.y)
    const fillTest = copy(buffer)

    for (let i = 0; i < fillTest.data.length; i++) {
        fillTest.data[i] ^= matchColor
    }

    const test = (x, y) => {
        if (x < 0 || y < 0 || x >= width || y >= height) { return false }
        return !getPixel(fillTest, x, y)
    }
    const paint = (x, y) => {
        setPixel(fillTest, x, y, 1)
        if (getPixel(pattern, x & 7, y & 7)) {
            setPixel(buffer, x, y, fill)
        } else if ((getPixel(buffer, x, y) & 0b11) === fill) {
            setPixel(buffer, x, y, 0)
        }
    }
    floodFillScanline(point.x, point.y, width, height, false, test, paint)
    return buffer
}

export function drawFreeformStart (buffer, {start, brush, fill, pattern, isFilled}) {
    const freeformState = createBuffer(getWidth(buffer), getHeight(buffer))
    drawPoint(freeformState, start.x, start.y, null, 1, null)
    if (isFilled) {
        drawPoint(buffer, start.x, start.y, null, fill, null)
    } else {
        drawPoint(buffer, start.x, start.y, brush, fill, pattern)
    }
    return { freeformState, buffer }
}

export function drawFreeformShapeOutline (buffer, freeformState, {start, end, brush, fill, pattern, isFilled}) {
    const points = bresenham(start.x, start.y, end.x, end.y)
    drawLinePoints(freeformState, points, null, 1, null)
    if (isFilled) {
        drawLinePoints(buffer, points, null, fill, null)
    } else {
        drawLinePoints(buffer, points, brush, fill, pattern)
    }
    return { freeformState, buffer }
}

export function closeFreeformShape (buffer, freeformState, { start, end, brush, fill, pattern, isFilled }) {
    const points = bresenham(start.x, start.y, end.x, end.y)
    drawLinePoints(freeformState, points, null, 1, null)


    if (isFilled) {
        const width = getWidth(buffer)
        const height = getHeight(buffer)
        for (let y = 0; y < height; y++) {
            let lastPixel = 0
            let startAt = 0
            for (let x = 0; x < width; x++) {
                const currentPixel = getPixel(freeformState, x, y)
                if (!currentPixel && lastPixel && !startAt) {
                    startAt = x
                } else if (!currentPixel && lastPixel && startAt) {
                    for (let _x = startAt; _x < x; _x++) {
                        drawPoint(buffer, _x, y, null, fill, pattern)
                    }
                    startAt = 0
                }
                lastPixel = currentPixel
            }
        }
    } else {
        drawLinePoints(buffer, points, brush, fill, pattern)
    }
    return buffer
}

// utilities

function order (a, b) {
    return a < b ? [a,b] : [b,a]
}

function drawPoint (buffer, px, py, brush, value, pattern) {
    const w = brush ? getWidth(brush) : 1
    const h = brush ? getHeight(brush): 1

    const offsetX = w >> 1
    const offsetY = h >> 1
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const ox = px + x - offsetX
            const oy = py + y - offsetY
            if ((!brush || getPixel(brush, x, y)) && (!pattern || getPixel(pattern, ox & 7, oy & 7))) {
                setPixel(buffer, ox, oy, value)
            }
        }
    }
}

function drawLinePoints(buffer, points, brush, value, pattern) {
    for (let i = 0; i < points.length; i++) {
        drawPoint(buffer, points[i].x, points[i].y, brush, value, pattern)
    }
    return buffer
}
