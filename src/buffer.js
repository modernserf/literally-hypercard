// buffer getter/setters
export function getPixel (buffer, x, y) {
    if (x < 0 || y < 0 || x >= buffer.width || y >= buffer.height) { return 0 }
    return buffer.data[x + y * buffer.width]
}

export function setPixel (buffer, x, y, value) {
    if (x < 0 || y < 0 || x >= buffer.width || y >= buffer.height) { return }
    // set value at every frame
    buffer.data[x + y * buffer.width] = value * 0b0101010101010101
}

function rawSetPixel (buffer, x, y, value) {
    buffer.data[x + y * buffer.width] = value
}

export function getWidth (buffer) {
    return buffer.width
}

export function getHeight (buffer) {
    return buffer.height
}

export function createBrush (arr) {
    const height = arr.length
    const width = arr[0].length
    const data = Uint16Array.from(arr.reduce((l, r) => l.concat(r)))
    return { height, width, data }
}

export function createPattern (arr) {
    const height = 8
    const width = 8
    const data = Uint16Array.from(arr.reduce((l, r) => l.concat(r)))
    return { height, width, data, }
}

export function createBuffer (width, height) {
    const data = new Uint16Array(height * width)
    return { width, height, data }
}

export function fillBuffer(buffer, value) {
    buffer.data.fill(value)
    return value
}

export function copy(buffer) {
    return {
        width: buffer.width,
        height: buffer.height,
        data: buffer.data.slice(0),
    }
}

export function getFramePixel(buffer, x, y, frame) {
    const data = buffer.data[x + y * buffer.width]
    // frame = (frame % 8) * 2
    frame = (frame & 7) << 1
    return (data >> frame) & 0b11
}

export function setImageData (ctx, buffer, scale, frame, colors) {
    const w = buffer.width
    const h = buffer.height

    const imageData = ctx.createImageData(w << scale, h << scale)

    const row = w * (4 << scale << scale)
    const block = 4 << scale

    if (colors) {
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const colorID = getFramePixel(buffer, x, y, frame)
                const px = colors[colorID]
                for (let yOffset = 0; yOffset < row; yOffset += (w * block)) {
                    for (let xOffset = 0; xOffset < block; xOffset += 4) {
                        const i = (y * row) + (x * block) + xOffset + yOffset
                        imageData.data[i] = px.r
                        imageData.data[i + 1] = px.g
                        imageData.data[i + 2] = px.b
                        imageData.data[i + 3] = 255
                    }
                }
            }
        }
    } else {
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const px = getPixel(buffer, x, y)
                if (px) {
                    for (let yOffset = 0; yOffset < row; yOffset += (w * block)) {
                        for (let xOffset = 0; xOffset < block; xOffset += 4) {
                            const i = (y * row) + (x * block) + xOffset + yOffset
                            imageData.data[i] = 0
                            imageData.data[i + 1] = 0
                            imageData.data[i + 2] = 0
                            imageData.data[i + 3] = 255
                        }
                    }
                }
            }
        }
    }



    return imageData
}

export function flipHorizontal (buffer) {
    const w = buffer.width
    const h = buffer.height
    const out = createBuffer(w, h)

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            rawSetPixel(out,
                w - x,
                y,
                getPixel(buffer, x, y))
        }
    }
    return out
}

export function flipVertical (buffer) {
    const w = buffer.width
    const h = buffer.height
    const out = createBuffer(w, h)

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            rawSetPixel(out,
                x,
                h - y,
                getPixel(buffer, x, y))
        }
    }
    return out
}
