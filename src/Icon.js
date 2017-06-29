import PropTypes from "prop-types"
import React, { Component } from "react"

export default class Icon extends Component {
    static propTypes = {
        scale: PropTypes.number.isRequired,
        pixels: PropTypes.array.isRequired,
    }
    componentDidMount () {
        if (this.ctx) { this.renderCanvas() }
    }
    shouldComponentUpdate () {
        return false
    }
    initRef = (e) => {
        this._ref = e
        this.ctx = e.getContext("2d")
    }
    renderCanvas = () => {
        const { pixels, scale } = this.props
        const height = pixels.length
        const width = pixels[0].length
        this.ctx.fillStyle = "white"
        this.ctx.fillRect(0,0, width << scale, height << scale)

        this.ctx.fillStyle = "black"
        for (let y = 0; y < height; y++) {
            for(let x = 0; x < width; x++) {
                if (pixels[y][x] === 1) {
                    this.ctx.fillRect(
                        x << scale,
                        y << scale,
                        1 << scale,
                        1 << scale)
                }
            }
        }
    }
    render () {
        const { pixels, scale } = this.props
        const height = pixels.length
        const width = pixels[0].length

        return (
            <canvas style={{display: "inline-block"}} ref={this.initRef}
                width={width << scale} height={height << scale}
            />
        )
    }
}
