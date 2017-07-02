import floodFillScanline from "./floodFillScanline"
import bresenham from "bresenham"
import { getPixel, setPixel, getWidth, getHeight, copy } from "./buffer"
import { colors } from "./config"

export function drawPencil (buffer, start, end, value) {
    const points = end ? bresenham(start.x, start.y, end.x, end.y) : [start]

    for (let i = 0; i < points.length; i++) {
        setPixel(buffer, points[i].x, points[i].y, value)
    }
    return buffer
}

export function drawLine (buffer, start, end, brush, stroke=colors.black) {
    const points = bresenham(start.x, start.y, end.x, end.y)
    return drawLinePoints(buffer, points, brush, stroke)
}

export function drawBrush (buffer, start, end, brush, fill) {
    const points = end ? bresenham(start.x, start.y, end.x, end.y) : [start]
    return drawLinePoints(buffer, points, brush, fill)
}

export function erase (buffer, start, end, brush) {
    const points = end ? bresenham(start.x, start.y, end.x, end.y) : [start]
    return drawLinePoints(buffer, points, brush, colors.white)
}

export function setRectangle (buffer, p0, p1, fill) {
    const [x0, x1] = order(p0.x, p1.x)
    const [y0, y1] = order(p0.y, p1.y)

    for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
            if (fill) {
                setPixel(buffer, x, y, fill)
            }
            // draw sides
            if (y === y0 || y === y1 || x === x0 || x === x1) {
                setPixel(buffer, x, y, colors.black)
            }
        }
    }

    return buffer
}

export function setEllipse (buffer, p0, p1, fill) {
    const stroke = colors.black

    const [x0, x1] = order(p0.x, p1.x)
    const [y0, y1] = order(p0.y, p1.y)
    // radii
    const width = (x1 - x0) >> 1
    const height = (y1 - y0) >> 1
    if (!width || !height) { return buffer }

    const xc = x0 + width
    const yc = y0 + height

    const a2 = width * width
    const b2 = height * height
    const fa2 = 4 * a2
    const fb2 = 4 * b2

    /* first half */
    for (let x = 0, y = height, sigma = 2*b2+a2*(1-2*height); b2*x <= a2*y; x++) {
        if (fill) {
            for (let _x = xc - x; _x <= xc + x; _x++) {
                setPixel(buffer, _x, yc + y - 1, fill)
                setPixel(buffer, _x, yc - y + 1, fill)
            }
        }

        setPixel(buffer, xc + x, yc + y, stroke)
        setPixel(buffer, xc - x, yc + y, stroke)
        setPixel(buffer, xc + x, yc - y, stroke)
        setPixel(buffer, xc - x, yc - y, stroke)

        if (sigma >= 0) {
            sigma += fa2 * (1 - y)
            y--
        }
        sigma += b2 * ((4 * x) + 6)
    }

    /* second half */
    for (let x = width, y = 0, sigma = 2*a2+b2*(1-2*width); a2*y <= b2*x; y++) {
        if (fill) {
            for (let _x = xc - x; _x <= xc + x; _x++) {
                setPixel(buffer, _x, yc + y, fill)
                setPixel(buffer, _x, yc - y, fill)
            }
        }

        setPixel(buffer, xc + x, yc + y, stroke)
        setPixel(buffer, xc - x, yc + y, stroke)
        setPixel(buffer, xc + x, yc - y, stroke)
        setPixel(buffer, xc - x, yc - y, stroke)

        if (sigma >= 0) {
            sigma += fb2 * (1 - x)
            x--
        }
        sigma += a2 * ((4 * y) + 6)
    }

    return buffer
}

export function setFill (buffer, point, fill) {
    const width = getWidth(buffer)
    const height = getHeight(buffer)
    const fillTest = copy(buffer)
    const matchColor = getPixel(buffer, point.x, point.y)

    const test = (x, y) => {
        if (x < 0 || y < 0 || x >= width || y >= height) { return false }
        const px = getPixel(fillTest, x, y)
        return px !== fill && px === matchColor
    }
    const paint = (x, y) => {
        setPixel(fillTest, x, y, fill)
        setPixel(buffer, x, y, fill)
    }
    floodFillScanline(point.x, point.y, width, height, false, test, paint)
    return buffer
}

// utilities

function order (a, b) {
    return a < b ? [a,b] : [b,a]
}

function drawPoint (buffer, px, py, brush, value) {
    const w = getWidth(brush)
    const h = getHeight(brush)
    const offsetX = w >> 1
    const offsetY = h >> 1
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            if (getPixel(brush, x, y)) {
                setPixel(
                    buffer,
                    px + x - offsetX,
                    py + y - offsetY,
                    value)
            }
        }
    }
}

function drawLinePoints(buffer, points, brush, value) {
    for (let i = 0; i < points.length; i++) {
        drawPoint(buffer, points[i].x, points[i].y, brush, value)
    }
    return buffer
}
