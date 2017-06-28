import React, { Component } from "react"
import "./App.css"

const width = 512
const height = 342
const scale = 1
const px = 1 << scale

class Canvas extends Component {
    state = {
        mouseDown: false,
        pixels: Array(width * height).fill(0),
    }
    componentDidMount () {
        if (this.ctx) { this.renderCanvas() }
    }
    // shouldComponentUpdate () {
    //     return false
    // }
    initRef = (e) => {
        this._ref = e
        this.ctx = e.getContext("2d")
    }
    renderCanvas = () => {
        this.ctx.fillStyle = "white"
        this.ctx.fillRect(0,0, width, height)

        this.ctx.fillStyle = "black"
        for (let y = 0; y < height; y++) {
            for(let x = 0; x < width; x++) {
                if (this.state.pixels[y * width + x]) {
                    this.ctx.fillRect(x << scale,y << scale, px,px)
                }
            }
        }
        requestAnimationFrame(this.renderCanvas)
    }
    getIndex = (e) => {
        const { top, left } = e.target.getBoundingClientRect()
        const x = e.clientX - left
        const y = e.clientY - top
        return (y >> scale) * width + (x >> scale)
    }
    onMouseDown = (e) => {
        const i = this.getIndex(e)
        this.setState((state) => {
            state.mouseDown = true
            state.pixels[i] = 1
            return state
        })

    }
    onMouseMove = (e) => {
        const i = this.getIndex(e)
        if (this.state.mouseDown) {
            this.setState((state) => {
                state.pixels[i] = 1
                return state
            })
        }
    }
    onMouseUp = () => {
        this.setState({ mouseDown: false })
    }
    render () {
        return (
            <canvas ref={this.initRef}
                width={width << scale} height={height << scale}
                onMouseDown={this.onMouseDown}
                onMouseUp={this.onMouseUp}
                onMouseMove={this.onMouseMove}
            />
        )
    }
}


class App extends Component {
    state = {
        pixels: Array(width * height).fill(0),
    }
    render() {
        return (
            <div className="App">
                <Canvas />
            </div>
        )
    }
}

export default App
