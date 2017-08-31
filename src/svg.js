import { jvm } from './jvectormap'

/**
 * Wrapper for SVG element.
 * @constructor
 * @extends jvm.AbstractElement
 * @param {String} name Tag name of the element
 * @param {Object} config Set of parameters to initialize element with
 */

jvm.SVGElement = function (name, config) {
  jvm.SVGElement.parentClass.apply(this, arguments)
}

jvm.inherits(jvm.SVGElement, jvm.AbstractElement)

jvm.SVGElement.svgns = 'http://www.w3.org/2000/svg'

/**
 * Creates DOM element.
 * @param {String} tagName Name of element
 * @private
 * @returns DOMElement
 */
jvm.SVGElement.prototype.createElement = function (tagName) {
  return document.createElementNS(jvm.SVGElement.svgns, tagName)
}

/**
 * Adds CSS class for underlying DOM element.
 * @param {String} className Name of CSS class name
 */
jvm.SVGElement.prototype.addClass = function (className) {
  this.node.setAttribute('class', className)
}

/**
 * Returns constructor for element by name prefixed with 'VML'.
 * @param {String} ctr Name of basic constructor to return
 * proper implementation for.
 * @returns Function
 * @private
 */
jvm.SVGElement.prototype.getElementCtr = function (ctr) {
  return jvm['SVG' + ctr]
}

jvm.SVGElement.prototype.getBBox = function () {
  return this.node.getBBox()
}

jvm.SVGGroupElement = function () {
  jvm.SVGGroupElement.parentClass.call(this, 'g')
}

jvm.inherits(jvm.SVGGroupElement, jvm.SVGElement)

jvm.SVGGroupElement.prototype.add = function (element) {
  this.node.appendChild(element.node)
}

jvm.SVGCanvasElement = function (container, width, height) {
  this.classPrefix = 'SVG'
  jvm.SVGCanvasElement.parentClass.call(this, 'svg')

  this.defsElement = new jvm.SVGElement('defs')
  this.node.appendChild(this.defsElement.node)

  jvm.AbstractCanvasElement.apply(this, arguments)
}

jvm.inherits(jvm.SVGCanvasElement, jvm.SVGElement)
jvm.mixin(jvm.SVGCanvasElement, jvm.AbstractCanvasElement)

jvm.SVGCanvasElement.prototype.setSize = function (width, height) {
  this.width = width
  this.height = height
  this.node.setAttribute('width', width)
  this.node.setAttribute('height', height)
}

jvm.SVGCanvasElement.prototype.applyTransformParams = function (scale, transX, transY) {
  this.scale = scale
  this.transX = transX
  this.transY = transY
  this.rootElement.node.setAttribute('transform', 'scale(' + scale + ') translate(' + transX + ', ' + transY + ')')
}

jvm.SVGShapeElement = function (name, config, style) {
  jvm.SVGShapeElement.parentClass.call(this, name, config)
  jvm.AbstractShapeElement.apply(this, arguments)
}

jvm.inherits(jvm.SVGShapeElement, jvm.SVGElement)
jvm.mixin(jvm.SVGShapeElement, jvm.AbstractShapeElement)

jvm.SVGShapeElement.prototype.applyAttr = function (attr, value) {
  var patternEl
  var imageEl
  var that = this

  if (attr === 'fill' && jvm.isImageUrl(value)) {
    if (!jvm.SVGShapeElement.images[value]) {
      jvm.whenImageLoaded(value).then(function (img) {
        imageEl = new jvm.SVGElement('image')
        imageEl.node.setAttributeNS('http://www.w3.org/1999/xlink', 'href', value)
        imageEl.applyAttr('x', '0')
        imageEl.applyAttr('y', '0')
        imageEl.applyAttr('width', img[0].width)
        imageEl.applyAttr('height', img[0].height)

        patternEl = new jvm.SVGElement('pattern')
        patternEl.applyAttr('id', 'image' + jvm.SVGShapeElement.imageCounter)
        patternEl.applyAttr('x', 0)
        patternEl.applyAttr('y', 0)
        patternEl.applyAttr('width', img[0].width / 2)
        patternEl.applyAttr('height', img[0].height / 2)
        patternEl.applyAttr('viewBox', '0 0 ' + img[0].width + ' ' + img[0].height)
        patternEl.applyAttr('patternUnits', 'userSpaceOnUse')
        patternEl.node.appendChild(imageEl.node)

        that.canvas.defsElement.node.appendChild(patternEl.node)

        jvm.SVGShapeElement.images[value] = jvm.SVGShapeElement.imageCounter++

        that.applyAttr('fill', 'url(#image' + jvm.SVGShapeElement.images[value] + ')')
      })
    } else {
      this.applyAttr('fill', 'url(#image' + jvm.SVGShapeElement.images[value] + ')')
    }
  } else {
    jvm.SVGShapeElement.parentClass.prototype.applyAttr.apply(this, arguments)
  }
}

jvm.SVGShapeElement.imageCounter = 1
jvm.SVGShapeElement.images = {}

jvm.SVGPathElement = function (config, style) {
  jvm.SVGPathElement.parentClass.call(this, 'path', config, style)
  this.node.setAttribute('fill-rule', 'evenodd')
}

jvm.inherits(jvm.SVGPathElement, jvm.SVGShapeElement)

jvm.SVGCircleElement = function (config, style) {
  jvm.SVGCircleElement.parentClass.call(this, 'circle', config, style)
}

jvm.inherits(jvm.SVGCircleElement, jvm.SVGShapeElement)

jvm.SVGImageElement = function (config, style) {
  jvm.SVGImageElement.parentClass.call(this, 'image', config, style)
}

jvm.inherits(jvm.SVGImageElement, jvm.SVGShapeElement)

jvm.SVGImageElement.prototype.applyAttr = function (attr, value) {
  var that = this

  if (attr == 'image') {
    jvm.whenImageLoaded(value).then(function (img) {
      that.node.setAttributeNS('http://www.w3.org/1999/xlink', 'href', value)
      that.width = img[0].width
      that.height = img[0].height
      that.applyAttr('width', that.width)
      that.applyAttr('height', that.height)

      that.applyAttr('x', that.cx - that.width / 2)
      that.applyAttr('y', that.cy - that.height / 2)

      jvm.$(that.node).trigger('imageloaded', [img])
    })
  } else if (attr == 'cx') {
    this.cx = value
    if (this.width) {
      this.applyAttr('x', value - this.width / 2)
    }
  } else if (attr == 'cy') {
    this.cy = value
    if (this.height) {
      this.applyAttr('y', value - this.height / 2)
    }
  } else {
    jvm.SVGImageElement.parentClass.prototype.applyAttr.apply(this, arguments)
  }
}

jvm.SVGTextElement = function (config, style) {
  jvm.SVGTextElement.parentClass.call(this, 'text', config, style)
}

jvm.inherits(jvm.SVGTextElement, jvm.SVGShapeElement)

jvm.SVGTextElement.prototype.applyAttr = function (attr, value) {
  if (attr === 'text') {
    this.node.textContent = value
  } else {
    jvm.SVGTextElement.parentClass.prototype.applyAttr.apply(this, arguments)
  }
}
