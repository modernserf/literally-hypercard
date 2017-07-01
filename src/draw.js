import floodFillScanline from "./floodFillScanline"
import bresenham from "bresenham"
import { getPixel, setPixel, getWidth, getHeight, createBuffer, composite } from "./buffer"
import { colors } from "./config"

// TODO: move to buffer?
export function drawPattern (buffer, pattern, x, y) {
    const h = getHeight(pattern)
    const w = getWidth(pattern)
    const px = getPixel(pattern, x % w, y % h)
    setPixel(buffer, x, y, px)
}

export function drawPencil (buffer, point) {
    setPixel(buffer, point.x, point.y, 1)
    return buffer
}

// TODO: line width
export function drawLine (buffer, start, end) {
    const points = bresenham(start.x, start.y, end.x, end.y)
    for (let i = 0; i < points.length; i++) {
        setPixel(buffer, points[i].x, points[i].y, 1)
    }
    return buffer
}

export function drawBrush (buffer, point, brush, pattern) {
    const w = getWidth(brush)
    const h = getHeight(brush)
    const offsetX = w >> 1
    const offsetY = h >> 1
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            if (getPixel(brush, x, y)) {
                drawPattern(
                    buffer,
                    pattern,
                    point.x + x - offsetX,
                    point.y + y - offsetY)
            }
        }
    }
    return buffer
}

export function erase (buffer, point, brush) {
    const w = getWidth(brush)
    const h = getHeight(brush)
    const offsetX = w >> 1
    const offsetY = h >> 1
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            if (getPixel(brush, x, y)) {
                setPixel(
                    buffer,
                    point.x + x - offsetX,
                    point.y + y - offsetY,
                    colors.erase)
            }
        }
    }
    return buffer
}

export function setRectangle (buffer, p0, p1, pattern) {
    const [x0, x1] = order(p0.x, p1.x)
    const [y0, y1] = order(p0.y, p1.y)

    for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
            if (pattern) {
                drawPattern(buffer, pattern, x, y)
            }
            // draw sides
            if (y === y0 || y === y1 || x === x0 || x === x1) {
                setPixel(buffer, x, y, 1)
            }
        }
    }

    return buffer
}

function order (a, b) {
    return a < b ? [a,b] : [b,a]
}

export function setEllipse (buffer, p0, p1, pattern) {
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
        if (pattern) {
            for (let _x = xc - x; _x <= xc + x; _x++) {
                drawPattern(buffer, pattern, _x, yc + y - 1)
                drawPattern(buffer, pattern, _x, yc - y + 1)
            }
        }

        setPixel(buffer, xc + x, yc + y, 1)
        setPixel(buffer, xc - x, yc + y, 1)
        setPixel(buffer, xc + x, yc - y, 1)
        setPixel(buffer, xc - x, yc - y, 1)

        if (sigma >= 0) {
            sigma += fa2 * (1 - y)
            y--
        }
        sigma += b2 * ((4 * x) + 6)
    }

    /* second half */
    for (let x = width, y = 0, sigma = 2*a2+b2*(1-2*width); a2*y <= b2*x; y++) {
        if (pattern) {
            for (let _x = xc - x; _x <= xc + x; _x++) {
                drawPattern(buffer, pattern, _x, yc + y)
                drawPattern(buffer, pattern, _x, yc - y)
            }
        }

        setPixel(buffer, xc + x, yc + y, 1)
        setPixel(buffer, xc - x, yc + y, 1)
        setPixel(buffer, xc + x, yc - y, 1)
        setPixel(buffer, xc - x, yc - y, 1)

        if (sigma >= 0) {
            sigma += fb2 * (1 - x)
            x--
        }
        sigma += a2 * ((4 * y) + 6)
    }

    return buffer
}

export function setFill (buffer, point, pattern) {
    const width = getWidth(buffer)
    const height = getHeight(buffer)
    const dest = createBuffer(width, height)
    const fillTest = composite(buffer, createBuffer(width, height))
    const test = (x, y) => {
        if (x < 0 || y < 0 || x >= width || y >= height) { return false }
        return !getPixel(fillTest, x, y)
    }
    const paint = (x, y) => {
        setPixel(fillTest, x, y, 1)
        drawPattern(dest, pattern, x, y)
    }
    floodFillScanline(point.x, point.y, width, height, false, test, paint)
    return composite(buffer, dest)
}
