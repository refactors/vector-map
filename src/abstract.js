import { jvm } from './jvectormap'

/**
 * Basic wrapper for DOM element.
 * @constructor
 * @param {String} name Tag name of the element
 * @param {Object} config Set of parameters to initialize element with
 */
jvm.AbstractElement = function (name, config) {
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

  if (config) {
    this.set(config)
  }
}

/**
 * Set attribute of the underlying DOM element.
 * @param {String} name Name of attribute
 * @param {Number|String} config Set of parameters to initialize element with
 */
jvm.AbstractElement.prototype.set = function (property, value) {
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
jvm.AbstractElement.prototype.get = function (property) {
  return this.properties[property]
}

/**
 * Applies attribute value to the underlying DOM element.
 * @param {String} name Name of attribute
 * @param {Number|String} config Value of attribute to apply
 * @private
 */
jvm.AbstractElement.prototype.applyAttr = function (property, value) {
  this.node.setAttribute(property, value)
}

jvm.AbstractElement.prototype.remove = function () {
  jvm.$(this.node).remove()
}

/**
 * Implements abstract vector canvas.
 * @constructor
 * @param {HTMLElement} container Container to put element to.
 * @param {Number} width Width of canvas.
 * @param {Number} height Height of canvas.
 */
jvm.AbstractCanvasElement = function (container, width, height) {
  this.container = container
  this.setSize(width, height)
  this.rootElement = new jvm[this.classPrefix + 'GroupElement']()
  this.node.appendChild(this.rootElement.node)
  this.container.appendChild(this.node)
}

/**
 * Add element to the certain group inside of the canvas.
 * @param {HTMLElement} element Element to add to canvas.
 * @param {HTMLElement} group Group to add element into or into root group if not provided.
 */
jvm.AbstractCanvasElement.prototype.add = function (element, group) {
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
jvm.AbstractCanvasElement.prototype.addPath = function (config, style, group) {
  var el = new jvm[this.classPrefix + 'PathElement'](config, style)

  this.add(el, group)
  return el
}

/**
 * Create circle and add it to the canvas.
 * @param {Object} config Parameters of path to create.
 * @param {Object} style Styles of the path to create.
 * @param {HTMLElement} group Group to add circle into.
 */
jvm.AbstractCanvasElement.prototype.addCircle = function (config, style, group) {
  var el = new jvm[this.classPrefix + 'CircleElement'](config, style)

  this.add(el, group)
  return el
}

/**
 * Create circle and add it to the canvas.
 * @param {Object} config Parameters of path to create.
 * @param {Object} style Styles of the path to create.
 * @param {HTMLElement} group Group to add circle into.
 */
jvm.AbstractCanvasElement.prototype.addImage = function (config, style, group) {
  var el = new jvm[this.classPrefix + 'ImageElement'](config, style)

  this.add(el, group)
  return el
}

/**
 * Create text and add it to the canvas.
 * @param {Object} config Parameters of path to create.
 * @param {Object} style Styles of the path to create.
 * @param {HTMLElement} group Group to add circle into.
 */
jvm.AbstractCanvasElement.prototype.addText = function (config, style, group) {
  var el = new jvm[this.classPrefix + 'TextElement'](config, style)

  this.add(el, group)
  return el
}

/**
 * Add group to the another group inside of the canvas.
 * @param {HTMLElement} group Group to add circle into or root group if not provided.
 */
jvm.AbstractCanvasElement.prototype.addGroup = function (parentGroup) {
  var el = new jvm[this.classPrefix + 'GroupElement']()

  if (parentGroup) {
    parentGroup.node.appendChild(el.node)
  } else {
    this.node.appendChild(el.node)
  }
  el.canvas = this
  return el
}

/**
 * Abstract shape element. Shape element represents some visual vector or raster object.
 * @constructor
 * @param {String} name Tag name of the element.
 * @param {Object} config Set of parameters to initialize element with.
 * @param {Object} style Object with styles to set on element initialization.
 */
jvm.AbstractShapeElement = function (name, config, style) {
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
jvm.AbstractShapeElement.prototype.setStyle = function (property, value) {
  var styles = {}

  if (typeof property === 'object') {
    styles = property
  } else {
    styles[property] = value
  }
  jvm.$.extend(this.style.current, styles)
  this.updateStyle()
}

jvm.AbstractShapeElement.prototype.updateStyle = function () {
  var attrs = {}

  jvm.AbstractShapeElement.mergeStyles(attrs, this.style.initial)
  jvm.AbstractShapeElement.mergeStyles(attrs, this.style.current)
  if (this.isHovered) {
    jvm.AbstractShapeElement.mergeStyles(attrs, this.style.hover)
  }
  if (this.isSelected) {
    jvm.AbstractShapeElement.mergeStyles(attrs, this.style.selected)
    if (this.isHovered) {
      jvm.AbstractShapeElement.mergeStyles(attrs, this.style.selectedHover)
    }
  }
  this.set(attrs)
}

jvm.AbstractShapeElement.mergeStyles = function (styles, newStyles) {
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
