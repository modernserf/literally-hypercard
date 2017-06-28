export default function floodFillScanline(x, y, width, height, diagonal, test, paint) {
    // xMin, xMax, y, down[true] / up[false], extendLeft, extendRight
    var ranges = [[x, x, y, null, true, true]]
    paint(x, y)

    const addNextLine = (newY, isNext, downwards) => {
        var rMinX = minX
        var inRange = false
        for(var x=minX; x<=maxX; x++) {
            // skip testing, if testing previous line within previous range
            var empty = (isNext || (x<r[0] || x>r[1])) && test(x, newY)
            if(!inRange && empty) {
                rMinX = x
                inRange = true
            }
            else if(inRange && !empty) {
                ranges.push([rMinX, x-1, newY, downwards, rMinX===minX, false])
                inRange = false
            }
            if(inRange) {
                paint(x, newY)
            }
            // skip
            if(!isNext && x===r[0]) {
                x = r[1]
            }
        }
        if(inRange) {
            ranges.push([rMinX, x-1, newY, downwards, rMinX===minX, true])
        }
    }

    let bugOut = 0
    while(ranges.length) {
        if (bugOut++ > 1000000) { throw new Error("infinite loop") }
        var r = ranges.pop()
        var down = r[3] === true
        var up =   r[3] === false

        // extendLeft
        var minX = r[0]
        y = r[2]
        if(r[4]) {
            while(minX>0 && test(minX-1, y)) {
                if (bugOut++ > 1000000) { throw new Error("infinite loop") }
                minX--
                paint(minX, y)
            }
        }
        var maxX = r[1]
        // extendRight
        if(r[5]) {
            while(maxX<width-1 && test(maxX+1, y)) {
                if (bugOut++ > 1000000) { throw new Error("infinite loop") }
                maxX++
                paint(maxX, y)
            }
        }

        if(diagonal) {
            // extend range looked at for next lines
            if(minX>0) minX--
            if(maxX<width-1) maxX++
        }
        else {
            // extend range ignored from previous line
            r[0]--
            r[1]++
        }

        if(y<height)
            addNextLine(y+1, !up, true)
        if(y>0)
            addNextLine(y-1, !down, false)
    }
}
