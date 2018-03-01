import React from 'react'
import Hammer from './hammer'
import {requestAnimationFrame} from './utils'
import store from './store'

export default class PinchableImage extends React.Component {
  static defaultProps = {
    data: [],
  }

  constructor(props) {
    super(props)
    this.state = {
      loadNow: props.isCurrent,
    }
  }

  componentDidMount() {
    requestAnimationFrame(() => {
      this.setState({
        loadNow: true,
      })
    })
  }

  bindEvents() {
    const mc1 = new Hammer.Manager(this.img)

    const singleTap = new Hammer.Tap({event: 'singletap'})
    const doubleTap = new Hammer.Tap({event: 'doubletap', taps: 2})
    mc1.add([doubleTap, singleTap])
    doubleTap.recognizeWith(singleTap)
    singleTap.requireFailure(doubleTap)
    // mc1.on('singletap', (e) => {alert(1)})
    mc1.on('doubletap', this.handleDoubleTap)

    mc1.add(new Hammer.Pan())
    mc1.on('pan', this.handlePan)

    mc1.add(new Hammer.Pinch())
    mc1.on('pinch', this.handlePinch)
    mc1.on('pinchend', (e) => {
      const scale = e.scale * (this.scaled || 1)
      this.scaled = scale
    })
  }

  clearScale() {
    this.zoomed = false
    this.container.style.transform = null
    this.lastX = 0
    this.lastY = 0
    this.scaled = 1
    store.disableSwipe = false
  }

  handleDoubleTap = (e) => {
    e.preventDefault()
    if (!this.props.isCurrent) { return }
    if (this.zoomed) {
      this.img.style.transition = 'transform .2s ease-in-out'
      requestAnimationFrame(() => {
        this.img.style.transform = null
        setTimeout(() => {
          this.img.style.transition = null
          this.clearScale()
        }, 200)
      })
      return
    }
    if (this.maxZoom > 1) {
      this.img.style.transition = 'transform .2s ease-in-out'
      requestAnimationFrame(() => {
        this.img.style.transform = `scale(${this.maxZoom})`
        this.zoomed = true
        store.disableSwipe = true

        setTimeout(() => {
          this.img.style.transition = null
        }, 200)
      })
    }
  }

  handlePan = (e) => {
    const {isCurrent, onClose} = this.props
    if (!isCurrent) { return }
    if (store.swiping) { return }
    if (!this.zoomed) {
      if ((e.direction === Hammer.DIRECTION_DOWN || e.direction === Hammer.DIRECTION_UP) &&
          !store.swiping) {
        this.container.style.transform = `translateY(${e.deltaY}px)`
        store.disableSwipe = true
      }

      if (e.isFinal) {
        if (Math.abs(e.deltaY) < 40) {
          this.container.style.transition = 'transform .2s ease-in-out'
          requestAnimationFrame(() => {
            this.container.style.transform = null
            setTimeout(() => {
              this.container.style.transition = null
              store.disableSwipe = false
            }, 200)
          })
        } else if (onClose) {
          store.disableSwipe = false
          onClose()
        }
      }
    } else {
      const x = e.deltaX + (this.lastX || 0)
      const y = e.deltaY + (this.lastY || 0)
      this.container.style.transform = `translate(${x}px, ${y}px)`
      if (e.isFinal) {
        this.lastX = x
        this.lastY = y
      }
    }
  }

  handlePinch = (e) => {
    const scale = e.scale * (this.scaled || 1)
    if (scale > 1) {
      this.img.style.transform = `scale(${scale})`
      this.zoomed = true
      store.disableSwipe = true
    } else {
      this.img.style.transform = null
      this.clearScale()
    }
  }

  handleLoaded = () => {
    const {src} = this.props
    let img = new Image()
    img.src = src
    this.size = {
      width: img.width,
      height: img.height,
    }
    this.maxZoom = img.width / this.img.width
    img = null

    // Make Pinchable after img loaded
    this.bindEvents()
  }

  renderImage() {
    const {src} = this.props
    const {loadNow} = this.state

    if (!loadNow) {
      return null
    }
    return (
      <img
        alt=""
        src={src}
        onLoad={this.handleLoaded}
        ref={el => { this.img = el }}
      />
    )
  }

  render() {
    const {className, style} = this.props

    return (
      <div className={className} style={style}>
        <div
          ref={el => { this.container = el }}
        >
          {this.renderImage()}
        </div>
      </div>
    )
  }
}
