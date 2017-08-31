import MapObject from './map-object'

export default class Region extends MapObject {
  constructor (config) {
    super()
    var bbox
    var text
    var offsets

    this.config = config
    this.map = this.config.map

    this.shape = config.canvas.addPath({
      d: config.path,
      'data-code': config.code
    }, config.style, config.canvas.rootElement)
    this.shape.addClass('jvectormap-region jvectormap-element')

    bbox = this.shape.getBBox()

    text = this.getLabelText(config.code)
    if (this.config.label && text) {
      offsets = this.getLabelOffsets(config.code)
      this.labelX = bbox.x + bbox.width / 2 + offsets[0]
      this.labelY = bbox.y + bbox.height / 2 + offsets[1]
      this.label = config.canvas.addText({
        text: text,
        'text-anchor': 'middle',
        'alignment-baseline': 'central',
        x: this.labelX,
        y: this.labelY,
        'data-code': config.code
      }, config.labelStyle, config.labelsGroup)
      this.label.addClass('jvectormap-region jvectormap-element')
    }
  }

  updateLabelPosition () {
    if (this.label) {
      this.label.set({
        x: this.labelX * this.map.scale + this.map.transX * this.map.scale,
        y: this.labelY * this.map.scale + this.map.transY * this.map.scale
      })
    }
  }
}
