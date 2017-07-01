import PropTypes from "prop-types"
import React, { Component } from "react"
import { setImageData, getWidth, getHeight } from "./buffer"

export default class Canvas extends Component {
    static propTypes = {
        pixels: PropTypes.object.isRequired,
        dispatch: PropTypes.func.isRequired,
        scale: PropTypes.number.isRequired,
    }
    state = {
        mouseDown: false,
        lastEvent: null,
    }
    frame = 0
    componentWillMount () {
        this.hasTouchEvents = "ontouchstart" in document.documentElement
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
        this.frame++
        const { scale } = this.props
        setImageData(this.ctx, this.props.pixels, scale, this.frame)
        requestAnimationFrame(this.renderCanvas)
    }
    getPoint = (e) => {
        e.preventDefault()
        const event = e.nativeEvent.targetTouches
            ? e.nativeEvent.targetTouches[0] || e.nativeEvent.changedTouches[0]
            : e

        const { scale } = this.props
        const { top, left } = this._ref.getBoundingClientRect()
        const x = event.clientX - left
        const y = event.clientY - top
        return { x: x >> scale, y: y >> scale }
    }
    onMouseDown = (e) => {
        this.setState({ mouseDown: true })
        this.props.dispatch("down", this.getPoint(e))
    }
    onDrag = (e) => {
        this.setState({ lastEvent: e.nativeEvent })
        this.props.dispatch("drag", this.getPoint(e))
    }
    onMouseMove = (e) => {
        const msg = this.state.mouseDown ? "drag" : "move"
        this.props.dispatch(msg, this.getPoint(e))
    }
    onMouseUp = (e) => {
        this.setState({ mouseDown: false })
        this.props.dispatch("up", this.getPoint(e))
    }
    render () {
        const { pixels, scale } = this.props
        const width = getWidth(pixels)
        const height = getHeight(pixels)

        const handlers = this.hasTouchEvents ? {
            onTouchStart: this.onMouseDown,
            onTouchMove: this.onDrag,
            onTouchEnd: this.onMouseUp,
        } : {
            onMouseDown: this.onMouseDown,
            onMouseUp: this.onMouseUp,
            onMouseMove: this.onMouseMove,
            onMouseLeave: this.onMouseUp,
        }

        return (
            <canvas ref={this.initRef}
                className="main-canvas"
                width={width << scale} height={height << scale}
                {...handlers}
            />
        )
    }
}
