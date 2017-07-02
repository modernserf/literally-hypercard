import PropTypes from "prop-types"
import React, { Component } from "react"
import { setImageData, getWidth, getHeight } from "./buffer"

export default class Icon extends Component {
    static propTypes = {
        scale: PropTypes.number.isRequired,
        pixels: PropTypes.object.isRequired,
        patterns: PropTypes.array,
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
        const { pixels, scale, patterns } = this.props
        setImageData(this.ctx, pixels, scale, 0, patterns)
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
