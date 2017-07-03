import PropTypes from "prop-types"
import React, { Component } from "react"
import { setImageData, getWidth, getHeight } from "./buffer"

export default class Icon extends Component {
    static propTypes = {
        scale: PropTypes.number.isRequired,
        pixels: PropTypes.object.isRequired,
        palette: PropTypes.object,
    }
    frame = 0
    componentDidMount () {
        if (this.ctx) { this.renderCanvas() }
    }
    shouldComponentUpdate () {
        return false
    }
    initRef = (e) => {
        if (!e) { return }
        this._ref = e
        this.ctx = e.getContext("2d")
    }
    renderCanvas = () => {
        const { pixels, scale, palette } = this.props
        const data = setImageData(this.ctx, pixels, scale, this.frame, palette)
        this.ctx.putImageData(data,0,0)
        this.frame++
        requestAnimationFrame(this.renderCanvas)
    }
    render () {
        const { pixels, scale } = this.props
        const height = getHeight(pixels)
        const width = getWidth(pixels)

        return (
            <canvas ref={this.initRef}
                width={width << scale} height={height << scale}
            />
        )
    }
}
