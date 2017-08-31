import jQuery from 'jquery'
import { whenImageLoaded, isImageUrl } from './helpers'

class Element {
  constructor (name, config) {
    /**
     * Underlying DOM element
     * @type {DOMElement}
     * @private
     */
    this.node = this.createElement(name)

    /**
     * Name of underlying element
     * @type {String}
     * @private
     */
    this.name = name

    /**
     * Internal store of attributes
     * @type {Object}
     * @private
     */
    this.properties = {}

    if (config) this.set(config)
  }

  /**
   * Set attribute of the underlying DOM element.
   * @param {String} name Name of attribute
   * @param {Number|String} config Set of parameters to initialize element with
   */
  set (property, value) {
    var key

    if (typeof property === 'object') {
      for (key in property) {
        this.properties[key] = property[key]
        this.applyAttr(key, property[key])
      }
    } else {
      this.properties[property] = value
      this.applyAttr(property, value)
    }
  }

  /**
  * Returns value of attribute.
  * @param {String} name Name of attribute
  */
  get (property) {
    return this.properties[property]
  }

  /**
   * Applies attribute value to the underlying DOM element.
   * @param {String} name Name of attribute
   * @param {Number|String} config Value of attribute to apply
   * @private
   */
  applyAttr (property, value) {
    this.node.setAttribute(property, value)
  }

  remove () {
    jQuery(this.node).remove()
  }

  /**
   * Creates DOM element.
   * @param {String} tagName Name of element
   * @private
   * @returns DOMElement
   */
  createElement (tagName) {
    return document.createElementNS('http://www.w3.org/2000/svg', tagName)
  }

  /**
   * Adds CSS class for underlying DOM element.
   * @param {String} className Name of CSS class name
   */
  addClass (className) {
    this.node.setAttribute('class', className)
  }

  getBBox () {
    return this.node.getBBox()
  }
}

export default class CanvasElement extends Element {
  constructor (container, width, height) {
    super('svg')

    this.defsElement = new Element('defs')
    this.node.appendChild(this.defsElement.node)
    this.container = container
    this.setSize(width, height)
    this.rootElement = new GroupElement()
    this.node.appendChild(this.rootElement.node)
    this.container.appendChild(this.node)
  }

  /**
   * Add element to the certain group inside of the canvas.
   * @param {HTMLElement} element Element to add to canvas.
   * @param {HTMLElement} group Group to add element into or into root group if not provided.
   */
  add (element, group) {
    group = group || this.rootElement
    group.add(element)
    element.canvas = this
  }

  /**
   * Create path and add it to the canvas.
   * @param {Object} config Parameters of path to create.
   * @param {Object} style Styles of the path to create.
   * @param {HTMLElement} group Group to add path into.
   */
  addPath (config, style, group) {
    var el = new PathElement(config, style)

    this.add(el, group)
    return el
  }

  /**
   * Create circle and add it to the canvas.
   * @param {Object} config Parameters of path to create.
   * @param {Object} style Styles of the path to create.
   * @param {HTMLElement} group Group to add circle into.
   */
  addCircle (config, style, group) {
    var el = new CircleElement(config, style)

    this.add(el, group)
    return el
  }

  /**
   * Create circle and add it to the canvas.
   * @param {Object} config Parameters of path to create.
   * @param {Object} style Styles of the path to create.
   * @param {HTMLElement} group Group to add circle into.
   */
  addImage (config, style, group) {
    var el = new ImageElement(config, style)

    this.add(el, group)
    return el
  }

  /**
   * Create text and add it to the canvas.
   * @param {Object} config Parameters of path to create.
   * @param {Object} style Styles of the path to create.
   * @param {HTMLElement} group Group to add circle into.
   */
  addText (config, style, group) {
    var el = new TextElement(config, style)

    this.add(el, group)
    return el
  }

  /**
   * Add group to the another group inside of the canvas.
   * @param {HTMLElement} group Group to add circle into or root group if not provided.
   */
  addGroup (parentGroup) {
    var el = new GroupElement()

    if (parentGroup) {
      parentGroup.node.appendChild(el.node)
    } else {
      this.node.appendChild(el.node)
    }
    el.canvas = this
    return el
  }

  setSize (width, height) {
    this.width = width
    this.height = height
    this.node.setAttribute('width', width)
    this.node.setAttribute('height', height)
  }

  applyTransformParams (scale, transX, transY) {
    this.scale = scale
    this.transX = transX
    this.transY = transY
    this.rootElement.node.setAttribute('transform', 'scale(' + scale + ') translate(' + transX + ', ' + transY + ')')
  }
}

var images = {}
var imageCounter = 1

class ShapeElement extends Element {
  /**
   * Abstract shape element. Shape element represents some visual vector or raster object.
   * @constructor
   * @param {String} name Tag name of the element.
   * @param {Object} config Set of parameters to initialize element with.
   * @param {Object} style Object with styles to set on element initialization.
   */
  constructor (name, config, style) {
    super(name, config)

    this.style = style || {}
    this.style.current = this.style.current || {}
    this.isHovered = false
    this.isSelected = false
    this.updateStyle()
  }

  /**
   * Set element's style.
   * @param {Object|String} property Could be string to set only one property or object to set several style properties at once.
   * @param {String} value Value to set in case only one property should be set.
   */
  setStyle (property, value) {
    var styles = {}

    if (typeof property === 'object') {
      styles = property
    } else {
      styles[property] = value
    }

    jQuery.extend(this.style.current, styles)
    this.updateStyle()
  }

  updateStyle () {
    var attrs = {}

    mergeStyles(attrs, this.style.initial)
    mergeStyles(attrs, this.style.current)
    if (this.isHovered) {
      mergeStyles(attrs, this.style.hover)
    }
    if (this.isSelected) {
      mergeStyles(attrs, this.style.selected)
      if (this.isHovered) {
        mergeStyles(attrs, this.style.selectedHover)
      }
    }
    this.set(attrs)
  }

  applyAttr (attr, value) {
    var patternEl
    var imageEl
    var that = this

    if (attr === 'fill' && isImageUrl(value)) {
      if (!images[value]) {
        whenImageLoaded(value).then(function (img) {
          imageEl = new Element('image')
          imageEl.node.setAttributeNS('http://www.w3.org/1999/xlink', 'href', value)
          imageEl.applyAttr('x', '0')
          imageEl.applyAttr('y', '0')
          imageEl.applyAttr('width', img[0].width)
          imageEl.applyAttr('height', img[0].height)

          patternEl = new Element('pattern')
          patternEl.applyAttr('id', 'image' + imageCounter)
          patternEl.applyAttr('x', 0)
          patternEl.applyAttr('y', 0)
          patternEl.applyAttr('width', img[0].width / 2)
          patternEl.applyAttr('height', img[0].height / 2)
          patternEl.applyAttr('viewBox', '0 0 ' + img[0].width + ' ' + img[0].height)
          patternEl.applyAttr('patternUnits', 'userSpaceOnUse')
          patternEl.node.appendChild(imageEl.node)

          that.canvas.defsElement.node.appendChild(patternEl.node)

          images[value] = imageCounter++

          that.applyAttr('fill', 'url(#image' + images[value] + ')')
        })
      } else {
        this.applyAttr('fill', 'url(#image' + images[value] + ')')
      }
    } else {
      super.applyAttr(attr, value)
    }
  }
}

class GroupElement extends Element {
  constructor () {
    super('g')
  }

  add (element) {
    this.node.appendChild(element.node)
  }
}

class PathElement extends ShapeElement {
  constructor (config, style) {
    super('path', config, style)
    this.node.setAttribute('fill-rule', 'evenodd')
  }
}

class CircleElement extends ShapeElement {
  constructor (config, style) {
    super('circle', config, style)
  }
}

class ImageElement extends ShapeElement {
  constructor (config, style) {
    super('image', config, style)
  }

  applyAttr (attr, value) {
    var that = this

    if (attr == 'image') {
      whenImageLoaded(value).then(function (img) {
        that.node.setAttributeNS('http://www.w3.org/1999/xlink', 'href', value)
        that.width = img[0].width
        that.height = img[0].height
        that.applyAttr('width', that.width)
        that.applyAttr('height', that.height)

        that.applyAttr('x', that.cx - that.width / 2)
        that.applyAttr('y', that.cy - that.height / 2)

        jQuery(that.node).trigger('imageloaded', [img])
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
      super.applyAttr(attr, value)
    }
  }
}

class TextElement extends ShapeElement {
  constructor (config, style) {
    super('text', config, style)
  }

  applyAttr (attr, value) {
    if (attr === 'text') {
      this.node.textContent = value
    } else {
      super.applyAttr(attr, value)
    }
  }
}

function mergeStyles (styles, newStyles) {
  var key

  newStyles = newStyles || {}
  for (key in newStyles) {
    if (newStyles[key] === null) {
      delete styles[key]
    } else {
      styles[key] = newStyles[key]
    }
  }
}
