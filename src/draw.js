import floodFillScanline from "./floodFillScanline"
import bresenham from "bresenham"
import { getPixel, setPixel, getWidth, getHeight, copy } from "./buffer"

export function drawPencil (buffer, { start, end, stroke }) {
    const points = end ? bresenham(start.x, start.y, end.x, end.y) : [start]

    for (let i = 0; i < points.length; i++) {
        setPixel(buffer, points[i].x, points[i].y, stroke)
    }
    return buffer
}

export function drawLine (buffer, {start, end, brush, stroke}) {
    const points = bresenham(start.x, start.y, end.x, end.y)
    return drawLinePoints(buffer, points, brush, stroke)
}

export function drawBrush (buffer, {start, end, brush, fill, pattern}) {
    const points = end ? bresenham(start.x, start.y, end.x, end.y) : [start]
    return drawLinePoints(buffer, points, brush, fill, pattern)
}

export function erase (buffer, {start, end, brush}) {
    const points = end ? bresenham(start.x, start.y, end.x, end.y) : [start]
    return drawLinePoints(buffer, points, brush, 0)
}

export function drawRectangle (buffer, { start, end, isFilled, stroke, fill, brush, pattern }) {
    const [x0, x1] = order(start.x, end.x)
    const [y0, y1] = order(start.y, end.y)

    // draw fill
    if (isFilled) {
        for (let y = y0; y <= y1; y++) {
            for (let x = x0; x <= x1; x++) {
                drawPoint(buffer,x,y, null, fill, pattern)
            }
        }
    }

    // TODO: just iterate through perimeter, not area
    // draw sides
    for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
            if (y === y0 || y === y1 || x === x0 || x === x1) {
                drawPoint(buffer,x,y, brush, stroke, pattern)
            }
        }
    }

    return buffer
}

function drawArc (buffer, width, height, xc, yc, xDirection, yDirection, { fill, isFilled, stroke, brush, pattern }) {
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
        }

        drawPoint(buffer, px, py, brush, stroke, pattern)

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
        }

        drawPoint(buffer, px, py, brush, stroke, pattern)

        if (sigma >= 0) {
            sigma += fb2 * (1 - x)
            x--
        }
        sigma += a2 * ((4 * y) + 6)
    }
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

// utilities

function order (a, b) {
    return a < b ? [a,b] : [b,a]
}

function drawPoint (buffer, px, py, brush, value, pattern ) {
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
