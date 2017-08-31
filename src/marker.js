import jQuery from 'jquery'
import MapObject from './map-object'

export default class Marker extends MapObject {
  constructor (config) {
    super()
    let text

    this.config = config
    this.map = this.config.map

    this.isImage = !!this.config.style.initial.image
    this.createShape()

    text = this.getLabelText(config.index)
    if (this.config.label && text) {
      this.offsets = this.getLabelOffsets(config.index)
      this.labelX = config.cx / this.map.scale - this.map.transX
      this.labelY = config.cy / this.map.scale - this.map.transY
      this.label = config.canvas.addText({
        text: text,
        'data-index': config.index,
        dy: '0.6ex',
        x: this.labelX,
        y: this.labelY
      }, config.labelStyle, config.labelsGroup)

      this.label.addClass('vectormap-marker vectormap-element')
    }
  }

  createShape () {
    var that = this

    if (this.shape) {
      this.shape.remove()
    }
    this.shape = this.config.canvas[this.isImage ? 'addImage' : 'addCircle']({
      'data-index': this.config.index,
      cx: this.config.cx,
      cy: this.config.cy
    }, this.config.style, this.config.group)

    this.shape.addClass('vectormap-marker vectormap-element')

    if (this.isImage) {
      jQuery(this.shape.node).on('imageloaded', function () {
        that.updateLabelPosition()
      })
    }
  }

  updateLabelPosition () {
    if (this.label) {
      this.label.set({
        x: this.labelX * this.map.scale + this.offsets[0] +
          this.map.transX * this.map.scale + 5 + (this.isImage ? (this.shape.width || 0) / 2 : this.shape.properties.r),
        y: this.labelY * this.map.scale + this.map.transY * this.map.scale + this.offsets[1]
      })
    }
  }

  setStyle (property, value) {
    var isImage

    super.setStyle(property, value)

    if (property === 'r') {
      this.updateLabelPosition()
    }

    isImage = !!this.shape.get('image')
    if (isImage !== this.isImage) {
      this.isImage = isImage
      this.config.style = jQuery.extend(true, {}, this.shape.style)
      this.createShape()
    }
  }
}
