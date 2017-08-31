import { jvm } from './jvectormap'

/**
 * Wrapper for VML element.
 * @constructor
 * @extends jvm.AbstractElement
 * @param {String} name Tag name of the element
 * @param {Object} config Set of parameters to initialize element with
 */

jvm.VMLElement = function (name, config) {
  if (!jvm.VMLElement.VMLInitialized) {
    jvm.VMLElement.initializeVML()
  }

  jvm.VMLElement.parentClass.apply(this, arguments)
}

jvm.inherits(jvm.VMLElement, jvm.AbstractElement)

/**
 * Shows if VML was already initialized for the current document or not.
 * @static
 * @private
 * @type {Boolean}
 */
jvm.VMLElement.VMLInitialized = false

/**
 * Initializes VML handling before creating the first element
 * (adds CSS class and creates namespace). Adds one of two forms
 * of createElement method depending of support by browser.
 * @static
 * @private
 */

 // The following method of VML handling is borrowed from the
 // Raphael library by Dmitry Baranovsky.

jvm.VMLElement.initializeVML = function () {
  try {
    if (!document.namespaces.rvml) {
      document.namespaces.add('rvml', 'urn:schemas-microsoft-com:vml')
    }
    /**
     * Creates DOM element.
     * @param {String} tagName Name of element
     * @private
     * @returns DOMElement
     */
    jvm.VMLElement.prototype.createElement = function (tagName) {
      return document.createElement('<rvml:' + tagName + ' class="rvml">')
    }
  } catch (e) {
    /**
     * @private
     */
    jvm.VMLElement.prototype.createElement = function (tagName) {
      return document.createElement('<' + tagName + ' xmlns="urn:schemas-microsoft.com:vml" class="rvml">')
    }
  }
  document.createStyleSheet().addRule('.rvml', 'behavior:url(#default#VML)')
  jvm.VMLElement.VMLInitialized = true
}

/**
 * Returns constructor for element by name prefixed with 'VML'.
 * @param {String} ctr Name of basic constructor to return
 * proper implementation for.
 * @returns Function
 * @private
 */
jvm.VMLElement.prototype.getElementCtr = function (ctr) {
  return jvm['VML' + ctr]
}

/**
 * Adds CSS class for underlying DOM element.
 * @param {String} className Name of CSS class name
 */
jvm.VMLElement.prototype.addClass = function (className) {
  jvm.$(this.node).addClass(className)
}

/**
 * Applies attribute value to the underlying DOM element.
 * @param {String} name Name of attribute
 * @param {Number|String} config Value of attribute to apply
 * @private
 */
jvm.VMLElement.prototype.applyAttr = function (attr, value) {
  this.node[attr] = value
}

/**
 * Returns boundary box for the element.
 * @returns {Object} Boundary box with numeric fields: x, y, width, height
 * @override
 */
jvm.VMLElement.prototype.getBBox = function () {
  var node = jvm.$(this.node)

  return {
    x: node.position().left / this.canvas.scale,
    y: node.position().top / this.canvas.scale,
    width: node.width() / this.canvas.scale,
    height: node.height() / this.canvas.scale
  }
}


jvm.VMLGroupElement = function () {
  jvm.VMLGroupElement.parentClass.call(this, 'group')

  this.node.style.left = '0px'
  this.node.style.top = '0px'
  this.node.coordorigin = '0 0'
}

jvm.inherits(jvm.VMLGroupElement, jvm.VMLElement)

jvm.VMLGroupElement.prototype.add = function (element) {
  this.node.appendChild(element.node)
}


jvm.VMLCanvasElement = function (container, width, height) {
  this.classPrefix = 'VML'
  jvm.VMLCanvasElement.parentClass.call(this, 'group')
  jvm.AbstractCanvasElement.apply(this, arguments)
  this.node.style.position = 'absolute'
}

jvm.inherits(jvm.VMLCanvasElement, jvm.VMLElement)
jvm.mixin(jvm.VMLCanvasElement, jvm.AbstractCanvasElement)

jvm.VMLCanvasElement.prototype.setSize = function (width, height) {
  var paths,
    groups,
    i,
    l

  this.width = width
  this.height = height
  this.node.style.width = width + 'px'
  this.node.style.height = height + 'px'
  this.node.coordsize = width + ' ' + height
  this.node.coordorigin = '0 0'
  if (this.rootElement) {
    paths = this.rootElement.node.getElementsByTagName('shape')
    for (i = 0, l = paths.length; i < l; i++) {
      paths[i].coordsize = width + ' ' + height
      paths[i].style.width = width + 'px'
      paths[i].style.height = height + 'px'
    }
    groups = this.node.getElementsByTagName('group')
    for (i = 0, l = groups.length; i < l; i++) {
      groups[i].coordsize = width + ' ' + height
      groups[i].style.width = width + 'px'
      groups[i].style.height = height + 'px'
    }
  }
}

jvm.VMLCanvasElement.prototype.applyTransformParams = function (scale, transX, transY) {
  this.scale = scale
  this.transX = transX
  this.transY = transY
  this.rootElement.node.coordorigin = (this.width - transX - this.width / 100) + ',' + (this.height - transY - this.height / 100)
  this.rootElement.node.coordsize = this.width / scale + ',' + this.height / scale
}


jvm.VMLShapeElement = function (name, config) {
  jvm.VMLShapeElement.parentClass.call(this, name, config)

  this.fillElement = new jvm.VMLElement('fill')
  this.strokeElement = new jvm.VMLElement('stroke')
  this.node.appendChild(this.fillElement.node)
  this.node.appendChild(this.strokeElement.node)
  this.node.stroked = false

  jvm.AbstractShapeElement.apply(this, arguments)
}

jvm.inherits(jvm.VMLShapeElement, jvm.VMLElement)
jvm.mixin(jvm.VMLShapeElement, jvm.AbstractShapeElement)

jvm.VMLShapeElement.prototype.applyAttr = function (attr, value) {
  switch (attr) {
    case 'fill':
      this.node.fillcolor = value
      break
    case 'fill-opacity':
      this.fillElement.node.opacity = Math.round(value * 100) + '%'
      break
    case 'stroke':
      if (value === 'none') {
        this.node.stroked = false
      } else {
        this.node.stroked = true
      }
      this.node.strokecolor = value
      break
    case 'stroke-opacity':
      this.strokeElement.node.opacity = Math.round(value * 100) + '%'
      break
    case 'stroke-width':
      if (parseInt(value, 10) === 0) {
        this.node.stroked = false
      } else {
        this.node.stroked = true
      }
      this.node.strokeweight = value
      break
    case 'd':
      this.node.path = jvm.VMLPathElement.pathSvgToVml(value)
      break
    default:
      jvm.VMLShapeElement.parentClass.prototype.applyAttr.apply(this, arguments)
  }
}


jvm.VMLPathElement = function (config, style) {
  var scale = new jvm.VMLElement('skew')

  jvm.VMLPathElement.parentClass.call(this, 'shape', config, style)

  this.node.coordorigin = '0 0'

  scale.node.on = true
  scale.node.matrix = '0.01,0,0,0.01,0,0'
  scale.node.offset = '0,0'

  this.node.appendChild(scale.node)
}

jvm.inherits(jvm.VMLPathElement, jvm.VMLShapeElement)

jvm.VMLPathElement.prototype.applyAttr = function (attr, value) {
  if (attr === 'd') {
    this.node.path = jvm.VMLPathElement.pathSvgToVml(value)
  } else {
    jvm.VMLShapeElement.prototype.applyAttr.call(this, attr, value)
  }
}

jvm.VMLPathElement.pathSvgToVml = function (path) {
  var cx = 0, cy = 0, ctrlx, ctrly

  path = path.replace(/(-?\d+)e(-?\d+)/g, '0')
  return path.replace(/([MmLlHhVvCcSs])\s*((?:-?\d*(?:\.\d+)?\s*,?\s*)+)/g, function (segment, letter, coords, index) {
    coords = coords.replace(/(\d)-/g, '$1,-')
            .replace(/^\s+/g, '')
            .replace(/\s+$/g, '')
            .replace(/\s+/g, ',').split(',')
    if (!coords[0]) coords.shift()
    for (var i = 0, l = coords.length; i < l; i++) {
      coords[i] = Math.round(100 * coords[i])
    }
    switch (letter) {
      case 'm':
        cx += coords[0]
        cy += coords[1]
        return 't' + coords.join(',')
      case 'M':
        cx = coords[0]
        cy = coords[1]
        return 'm' + coords.join(',')
      case 'l':
        cx += coords[0]
        cy += coords[1]
        return 'r' + coords.join(',')
      case 'L':
        cx = coords[0]
        cy = coords[1]
        return 'l' + coords.join(',')
      case 'h':
        cx += coords[0]
        return 'r' + coords[0] + ',0'
      case 'H':
        cx = coords[0]
        return 'l' + cx + ',' + cy
      case 'v':
        cy += coords[0]
        return 'r0,' + coords[0]
      case 'V':
        cy = coords[0]
        return 'l' + cx + ',' + cy
      case 'c':
        ctrlx = cx + coords[coords.length - 4]
        ctrly = cy + coords[coords.length - 3]
        cx += coords[coords.length - 2]
        cy += coords[coords.length - 1]
        return 'v' + coords.join(',')
      case 'C':
        ctrlx = coords[coords.length - 4]
        ctrly = coords[coords.length - 3]
        cx = coords[coords.length - 2]
        cy = coords[coords.length - 1]
        return 'c' + coords.join(',')
      case 's':
        coords.unshift(cy - ctrly)
        coords.unshift(cx - ctrlx)
        ctrlx = cx + coords[coords.length - 4]
        ctrly = cy + coords[coords.length - 3]
        cx += coords[coords.length - 2]
        cy += coords[coords.length - 1]
        return 'v' + coords.join(',')
      case 'S':
        coords.unshift(cy + cy - ctrly)
        coords.unshift(cx + cx - ctrlx)
        ctrlx = coords[coords.length - 4]
        ctrly = coords[coords.length - 3]
        cx = coords[coords.length - 2]
        cy = coords[coords.length - 1]
        return 'c' + coords.join(',')
    }
    return ''
  }).replace(/z/g, 'e')
}

jvm.VMLCircleElement = function (config, style) {
  jvm.VMLCircleElement.parentClass.call(this, 'oval', config, style)
}

jvm.inherits(jvm.VMLCircleElement, jvm.VMLShapeElement)

jvm.VMLCircleElement.prototype.applyAttr = function (attr, value) {
  switch (attr) {
    case 'r':
      this.node.style.width = value * 2 + 'px'
      this.node.style.height = value * 2 + 'px'
      this.applyAttr('cx', this.get('cx') || 0)
      this.applyAttr('cy', this.get('cy') || 0)
      break
    case 'cx':
      if (!value) return
      this.node.style.left = value - (this.get('r') || 0) + 'px'
      break
    case 'cy':
      if (!value) return
      this.node.style.top = value - (this.get('r') || 0) + 'px'
      break
    default:
      jvm.VMLCircleElement.parentClass.prototype.applyAttr.call(this, attr, value)
  }
}
