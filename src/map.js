import jQuery from 'jquery'
import 'jquery-mousewheel'
import Region from './region'
import Marker from './marker'
import DataSeries from './data-series'
import Proj from './proj'
import Canvas from './canvas'

export class Map {
  /**
   * Creates map, draws paths, binds events.
   * @constructor
   * @param {Object} params Parameters to initialize map with.
   * @param {String} params.map Name of the map in the format <code>territory_proj_lang</code> where <code>territory</code> is a unique code or name of the territory which the map represents (ISO 3166 standard is used where possible), <code>proj</code> is a name of projection used to generate representation of the map on the plane (projections are named according to the conventions of proj4 utility) and <code>lang</code> is a code of the language, used for the names of regions.
   * @param {String} params.backgroundColor Background color of the map in CSS format.
   * @param {Boolean} params.zoomOnScroll When set to true map could be zoomed using mouse scroll. Default value is <code>true</code>.
   * @param {Boolean} params.zoomOnScrollSpeed Mouse scroll speed. Number from 1 to 10. Default value is <code>3</code>.
   * @param {Boolean} params.panOnDrag When set to true, the map pans when being dragged. Default value is <code>true</code>.
   * @param {Number} params.zoomMax Indicates the maximum zoom ratio which could be reached zooming the map. Default value is <code>8</code>.
   * @param {Number} params.zoomMin Indicates the minimum zoom ratio which could be reached zooming the map. Default value is <code>1</code>.
   * @param {Number} params.zoomStep Indicates the multiplier used to zoom map with +/- buttons. Default value is <code>1.6</code>.
   * @param {Boolean} params.zoomAnimate Indicates whether or not to animate changing of map zoom with zoom buttons.
   * @param {Boolean} params.regionsSelectable When set to true regions of the map could be selected. Default value is <code>false</code>.
   * @param {Boolean} params.regionsSelectableOne Allow only one region to be selected at the moment. Default value is <code>false</code>.
   * @param {Boolean} params.markersSelectable When set to true markers on the map could be selected. Default value is <code>false</code>.
   * @param {Boolean} params.markersSelectableOne Allow only one marker to be selected at the moment. Default value is <code>false</code>.
   * @param {Object} params.regionStyle Set the styles for the map's regions. Each region or marker has four states: <code>initial</code> (default state), <code>hover</code> (when the mouse cursor is over the region or marker), <code>selected</code> (when region or marker is selected), <code>selectedHover</code> (when the mouse cursor is over the region or marker and it's selected simultaneously). Styles could be set for each of this states. Default value for that parameter is:
  <pre>{
    initial: {
      fill: 'white',
      "fill-opacity": 1,
      stroke: 'none',
      "stroke-width": 0,
      "stroke-opacity": 1
    },
    hover: {
      "fill-opacity": 0.8,
      cursor: 'pointer'
    },
    selected: {
      fill: 'yellow'
    },
    selectedHover: {
    }
  }</pre>
  * @param {Object} params.regionLabelStyle Set the styles for the regions' labels. Each region or marker has four states: <code>initial</code> (default state), <code>hover</code> (when the mouse cursor is over the region or marker), <code>selected</code> (when region or marker is selected), <code>selectedHover</code> (when the mouse cursor is over the region or marker and it's selected simultaneously). Styles could be set for each of this states. Default value for that parameter is:
  <pre>{
    initial: {
      'font-family': 'Verdana',
      'font-size': '12',
      'font-weight': 'bold',
      cursor: 'default',
      fill: 'black'
    },
    hover: {
      cursor: 'pointer'
    }
  }</pre>
  * @param {Object} params.markerStyle Set the styles for the map's markers. Any parameter suitable for <code>regionStyle</code> could be used as well as numeric parameter <code>r</code> to set the marker's radius. Default value for that parameter is:
  <pre>{
    initial: {
      fill: 'grey',
      stroke: '#505050',
      "fill-opacity": 1,
      "stroke-width": 1,
      "stroke-opacity": 1,
      r: 5
    },
    hover: {
      stroke: 'black',
      "stroke-width": 2,
      cursor: 'pointer'
    },
    selected: {
      fill: 'blue'
    },
    selectedHover: {
    }
  }</pre>
  * @param {Object} params.markerLabelStyle Set the styles for the markers' labels. Default value for that parameter is:
  <pre>{
    initial: {
      'font-family': 'Verdana',
      'font-size': '12',
      'font-weight': 'bold',
      cursor: 'default',
      fill: 'black'
    },
    hover: {
      cursor: 'pointer'
    }
  }</pre>
  * @param {Object|Array} params.markers Set of markers to add to the map during initialization. In case of array is provided, codes of markers will be set as string representations of array indexes. Each marker is represented by <code>latLng</code> (array of two numeric values), <code>name</code> (string which will be show on marker's tip) and any marker styles.
  * @param {Object} params.series Object with two keys: <code>markers</code> and <code>regions</code>. Each of which is an array of series configs to be applied to the respective map elements. See <a href="DataSeries.html">DataSeries</a> description for a list of parameters available.
  * @param {Object|String} params.focusOn This parameter sets the initial position and scale of the map viewport. See <code>setFocus</code> docuemntation for possible parameters.
  * @param {Object} params.labels Defines parameters for rendering static labels. Object could contain two keys: <code>regions</code> and <code>markers</code>. Each key value defines configuration object with the following possible options:
  <ul>
    <li><code>render {Function}</code> - defines method for converting region code or marker index to actual label value.</li>
    <li><code>offsets {Object|Function}</code> - provides method or object which could be used to define label offset by region code or marker index.</li>
  </ul>
  <b>Plase note: static labels feature is not supported in Internet Explorer 8 and below.</b>
  * @param {Array|Object|String} params.selectedRegions Set initially selected regions.
  * @param {Array|Object|String} params.selectedMarkers Set initially selected markers.
  * @param {Function} params.onRegionTipShow <code>(Event e, Object tip, String code)</code> Will be called right before the region tip is going to be shown.
  * @param {Function} params.onRegionOver <code>(Event e, String code)</code> Will be called on region mouse over event.
  * @param {Function} params.onRegionOut <code>(Event e, String code)</code> Will be called on region mouse out event.
  * @param {Function} params.onRegionClick <code>(Event e, String code)</code> Will be called on region click event.
  * @param {Function} params.onRegionSelected <code>(Event e, String code, Boolean isSelected, Array selectedRegions)</code> Will be called when region is (de)selected. <code>isSelected</code> parameter of the callback indicates whether region is selected or not. <code>selectedRegions</code> contains codes of all currently selected regions.
  * @param {Function} params.onMarkerTipShow <code>(Event e, Object tip, String code)</code> Will be called right before the marker tip is going to be shown.
  * @param {Function} params.onMarkerOver <code>(Event e, String code)</code> Will be called on marker mouse over event.
  * @param {Function} params.onMarkerOut <code>(Event e, String code)</code> Will be called on marker mouse out event.
  * @param {Function} params.onMarkerClick <code>(Event e, String code)</code> Will be called on marker click event.
  * @param {Function} params.onMarkerSelected <code>(Event e, String code, Boolean isSelected, Array selectedMarkers)</code> Will be called when marker is (de)selected. <code>isSelected</code> parameter of the callback indicates whether marker is selected or not. <code>selectedMarkers</code> contains codes of all currently selected markers.
  * @param {Function} params.onViewportChange <code>(Event e, Number scale)</code> Triggered when the map's viewport is changed (map was panned or zoomed).
  */
  constructor (params) {
    this.transX = 0
    this.transY = 0
    this.scale = 1
    this.baseTransX = 0
    this.baseTransY = 0
    this.baseScale = 1
    this.width = 0
    this.height = 0
    var map = this
    var e

    this.params = jQuery.extend(true, {}, defaultParams, params)
    this.params.container = jQuery('#' + this.params.container)

    if (!maps[this.params.map]) {
      throw new Error('Attempt to use map which was not loaded: ' + this.params.map)
    }

    this.mapData = maps[this.params.map]
    this.markers = {}
    this.regions = {}
    this.regionsColors = {}
    this.regionsData = {}

    this.container = jQuery('<div>').addClass('vectormap-container')
    if (this.params.container) {
      this.params.container.append(this.container)
    }
    this.container.data('mapObject', this)

    this.container.dblclick((event) => {
      var offset = jQuery(this.container).offset()
      var centerX = event.pageX - offset.left
      var centerY = event.pageY - offset.top
      this.tip.hide()
      this.setScale(this.scale * 1.6, centerX, centerY, false, this.params.zoomAnimate)
      event.preventDefault()
    })

    this.defaultWidth = this.mapData.width
    this.defaultHeight = this.mapData.height

    this.setBackgroundColor(this.params.backgroundColor)

    this.onResize = function () {
      map.updateSize()
    }
    jQuery(window).resize(this.onResize)

    for (e in apiEvents) {
      if (this.params[e]) {
        this.container.on(apiEvents[e] + '.vectormap', this.params[e])
      }
    }

    this.canvas = new Canvas(this.container[0], this.width, this.height)

    if (this.params.bindTouchEvents) {
      if (('ontouchstart' in window) || (window.DocumentTouch && document instanceof DocumentTouch)) {
        this.bindContainerTouchEvents()
      } else if (window.MSGesture) {
        this.bindContainerPointerEvents()
      }
    }
    this.bindContainerEvents()
    this.bindElementEvents()
    this.createTip()
    if (this.params.zoomButtons) {
      this.bindZoomButtons()
    }

    this.createRegions()
    this.createMarkers(this.params.markers || {})

    this.updateSize()

    if (this.params.focusOn) {
      if (typeof this.params.focusOn === 'string') {
        this.params.focusOn = {region: this.params.focusOn}
      } else if (jQuery.isArray(this.params.focusOn)) {
        this.params.focusOn = {regions: this.params.focusOn}
      }
      this.setFocus(this.params.focusOn)
    }

    if (this.params.selectedRegions) {
      this.setSelectedRegions(this.params.selectedRegions)
    }
    if (this.params.selectedMarkers) {
      this.setSelectedMarkers(this.params.selectedMarkers)
    }

    this.legendCntHorizontal = jQuery('<div/>').addClass('vectormap-legend-cnt vectormap-legend-cnt-h')
    this.legendCntVertical = jQuery('<div/>').addClass('vectormap-legend-cnt vectormap-legend-cnt-v')
    this.container.append(this.legendCntHorizontal)
    this.container.append(this.legendCntVertical)

    if (this.params.series) {
      this.createSeries()
    }
  }

  /**
   * Set background color of the map.
   * @param {String} backgroundColor Background color in CSS format.
   */
  setBackgroundColor (backgroundColor) {
    this.container.css('background-color', backgroundColor)
  }

  resize () {
    var curBaseScale = this.baseScale
    if (this.width / this.height > this.defaultWidth / this.defaultHeight) {
      this.baseScale = this.height / this.defaultHeight
      this.baseTransX = Math.abs(this.width - this.defaultWidth * this.baseScale) / (2 * this.baseScale)
    } else {
      this.baseScale = this.width / this.defaultWidth
      this.baseTransY = Math.abs(this.height - this.defaultHeight * this.baseScale) / (2 * this.baseScale)
    }
    this.scale *= this.baseScale / curBaseScale
    this.transX *= this.baseScale / curBaseScale
    this.transY *= this.baseScale / curBaseScale
  }

  /**
   * Synchronize the size of the map with the size of the container. Suitable in situations where the size of the container is changed programmatically or container is shown after it became visible.
   */
  updateSize () {
    this.width = this.container.width()
    this.height = this.container.height()
    this.resize()
    this.canvas.setSize(this.width, this.height)
    this.applyTransform()
  }

  /**
   * Reset all the series and show the map with the initial zoom.
   */
  reset () {
    var key,
      i

    for (key in this.series) {
      for (i = 0; i < this.series[key].length; i++) {
        this.series[key][i].clear()
      }
    }
    this.scale = this.baseScale
    this.transX = this.baseTransX
    this.transY = this.baseTransY
    this.applyTransform()
  }

  applyTransform () {
    var maxTransX,
      maxTransY,
      minTransX,
      minTransY

    if (this.defaultWidth * this.scale <= this.width) {
      maxTransX = (this.width - this.defaultWidth * this.scale) / (2 * this.scale)
      minTransX = (this.width - this.defaultWidth * this.scale) / (2 * this.scale)
    } else {
      maxTransX = 0
      minTransX = (this.width - this.defaultWidth * this.scale) / this.scale
    }

    if (this.defaultHeight * this.scale <= this.height) {
      maxTransY = (this.height - this.defaultHeight * this.scale) / (2 * this.scale)
      minTransY = (this.height - this.defaultHeight * this.scale) / (2 * this.scale)
    } else {
      maxTransY = 0
      minTransY = (this.height - this.defaultHeight * this.scale) / this.scale
    }

    if (this.transY > maxTransY) {
      this.transY = maxTransY
    } else if (this.transY < minTransY) {
      this.transY = minTransY
    }
    if (this.transX > maxTransX) {
      this.transX = maxTransX
    } else if (this.transX < minTransX) {
      this.transX = minTransX
    }

    this.canvas.applyTransformParams(this.scale, this.transX, this.transY)

    if (this.markers) {
      this.repositionMarkers()
    }

    this.repositionLabels()

    this.container.trigger('viewportChange', [this.scale / this.baseScale, this.transX, this.transY])
  }

  bindContainerEvents () {
    var mouseDown = false,
      oldPageX,
      oldPageY,
      map = this

    if (this.params.panOnDrag) {
      this.container.mousemove(function (e) {
        if (mouseDown) {
          map.transX -= (oldPageX - e.pageX) / map.scale
          map.transY -= (oldPageY - e.pageY) / map.scale

          map.applyTransform()

          oldPageX = e.pageX
          oldPageY = e.pageY
        }
        return false
      }).mousedown(function (e) {
        mouseDown = true
        oldPageX = e.pageX
        oldPageY = e.pageY
        return false
      })

      this.onContainerMouseUp = function () {
        mouseDown = false
      }
      jQuery('body').mouseup(this.onContainerMouseUp)
    }

    if (this.params.zoomOnScroll) {
      this.container.mousewheel(function (event, delta, deltaX, deltaY) {
        var offset = jQuery(map.container).offset(),
          centerX = event.pageX - offset.left,
          centerY = event.pageY - offset.top,
          zoomStep = Math.pow(1 + map.params.zoomOnScrollSpeed / 1000, event.deltaFactor * event.deltaY)

        map.tip.hide()

        map.setScale(map.scale * zoomStep, centerX, centerY)
        event.preventDefault()
      })
    }
  }

  bindContainerTouchEvents () {
    var touchStartScale,
      touchStartDistance,
      map = this,
      touchX,
      touchY,
      centerTouchX,
      centerTouchY,
      lastTouchesLength,
      handleTouchEvent = function (e) {
        var touches = e.originalEvent.touches,
          offset,
          scale,
          transXOld,
          transYOld

        if (e.type == 'touchstart') {
          lastTouchesLength = 0
        }

        if (touches.length == 1) {
          if (lastTouchesLength == 1) {
            transXOld = map.transX
            transYOld = map.transY
            map.transX -= (touchX - touches[0].pageX) / map.scale
            map.transY -= (touchY - touches[0].pageY) / map.scale
            map.applyTransform()
            map.tip.hide()
            if (transXOld != map.transX || transYOld != map.transY) {
              e.preventDefault()
            }
          }
          touchX = touches[0].pageX
          touchY = touches[0].pageY
        } else if (touches.length == 2) {
          if (lastTouchesLength == 2) {
            scale = Math.sqrt(
                Math.pow(touches[0].pageX - touches[1].pageX, 2) +
                Math.pow(touches[0].pageY - touches[1].pageY, 2)
              ) / touchStartDistance
            map.setScale(
                touchStartScale * scale,
                centerTouchX,
                centerTouchY
              )
            map.tip.hide()
            e.preventDefault()
          } else {
            offset = jQuery(map.container).offset()
            if (touches[0].pageX > touches[1].pageX) {
              centerTouchX = touches[1].pageX + (touches[0].pageX - touches[1].pageX) / 2
            } else {
              centerTouchX = touches[0].pageX + (touches[1].pageX - touches[0].pageX) / 2
            }
            if (touches[0].pageY > touches[1].pageY) {
              centerTouchY = touches[1].pageY + (touches[0].pageY - touches[1].pageY) / 2
            } else {
              centerTouchY = touches[0].pageY + (touches[1].pageY - touches[0].pageY) / 2
            }
            centerTouchX -= offset.left
            centerTouchY -= offset.top
            touchStartScale = map.scale
            touchStartDistance = Math.sqrt(
                Math.pow(touches[0].pageX - touches[1].pageX, 2) +
                Math.pow(touches[0].pageY - touches[1].pageY, 2)
              )
          }
        }

        lastTouchesLength = touches.length
      }

    jQuery(this.container).bind('touchstart', handleTouchEvent)
    jQuery(this.container).bind('touchmove', handleTouchEvent)
  }

  bindContainerPointerEvents () {
    var map = this,
      gesture = new MSGesture(),
      element = this.container[0],
      handlePointerDownEvent = function (e) {
        gesture.addPointer(e.pointerId)
      },
      handleGestureEvent = function (e) {
        var offset,
          scale,
          transXOld,
          transYOld

        if (e.translationX != 0 || e.translationY != 0) {
          transXOld = map.transX
          transYOld = map.transY
          map.transX += e.translationX / map.scale
          map.transY += e.translationY / map.scale
          map.applyTransform()
          map.tip.hide()
          if (transXOld != map.transX || transYOld != map.transY) {
            e.preventDefault()
          }
        }
        if (e.scale != 1) {
          map.setScale(
              map.scale * e.scale,
              e.offsetX,
              e.offsetY
            )
          map.tip.hide()
          e.preventDefault()
        }
      }

    gesture.target = element
    element.addEventListener('MSGestureChange', handleGestureEvent, false)
    element.addEventListener('pointerdown', handlePointerDownEvent, false)
  }

  bindElementEvents () {
    var map = this,
      pageX,
      pageY,
      mouseMoved

    this.container.mousemove(function (e) {
      if (Math.abs(pageX - e.pageX) + Math.abs(pageY - e.pageY) > 2) {
        mouseMoved = true
      }
    })

    /* Can not use common class selectors here because of the bug in jQuery
       SVG handling, use with caution. */
    this.container.delegate("[class~='vectormap-element']", 'mouseover mouseout', function (e) {
      var baseVal = jQuery(this).attr('class').baseVal || jQuery(this).attr('class'),
        type = baseVal.indexOf('vectormap-region') === -1 ? 'marker' : 'region',
        code = type == 'region' ? jQuery(this).attr('data-code') : jQuery(this).attr('data-index'),
        element = type == 'region' ? map.regions[code].element : map.markers[code].element,
        tipText = type == 'region' ? map.mapData.paths[code].name : (map.markers[code].config.name || ''),
        tipShowEvent = jQuery.Event(type + 'TipShow.vectormap'),
        overEvent = jQuery.Event(type + 'Over.vectormap')

      if (e.type == 'mouseover') {
        map.container.trigger(overEvent, [code])
        if (!overEvent.isDefaultPrevented()) {
          element.setHovered(true)
        }

        map.tip.text(tipText)
        map.container.trigger(tipShowEvent, [map.tip, code])
        if (!tipShowEvent.isDefaultPrevented()) {
          map.tip.show()
          map.tipWidth = map.tip.width()
          map.tipHeight = map.tip.height()
        }
      } else {
        element.setHovered(false)
        map.tip.hide()
        map.container.trigger(type + 'Out.vectormap', [code])
      }
    })

    /* Can not use common class selectors here because of the bug in jQuery
       SVG handling, use with caution. */
    this.container.delegate("[class~='vectormap-element']", 'mousedown', function (e) {
      pageX = e.pageX
      pageY = e.pageY
      mouseMoved = false
    })

    /* Can not use common class selectors here because of the bug in jQuery
       SVG handling, use with caution. */
    this.container.on('click', "[class~='vectormap-element']", function (event) {
      var baseVal = jQuery(this).attr('class').baseVal ? jQuery(this).attr('class').baseVal : jQuery(this).attr('class'),
        type = baseVal.indexOf('vectormap-region') === -1 ? 'marker' : 'region',
        code = type == 'region' ? jQuery(this).attr('data-code') : jQuery(this).attr('data-index'),
        clickEvent = jQuery.Event(type + 'Click.vectormap'),
        element = type == 'region' ? map.regions[code].element : map.markers[code].element

      if (!mouseMoved) {
        map.container.trigger(clickEvent, [code, event])
        if ((type === 'region' && map.params.regionsSelectable) || (type === 'marker' && map.params.markersSelectable)) {
          if (!clickEvent.isDefaultPrevented()) {
            if (map.params[type + 'sSelectableOne']) {
              map.clearSelected(type + 's')
            }
            element.setSelected(!element.isSelected)
          }
        }
      }
    })
  }

  bindZoomButtons () {
    var map = this

    jQuery('<div/>').addClass('vectormap-zoomin').text('+').appendTo(this.container)
    jQuery('<div/>').addClass('vectormap-zoomout').html('&#x2212;').appendTo(this.container)

    this.container.find('.vectormap-zoomin').click(function () {
      map.setScale(map.scale * map.params.zoomStep, map.width / 2, map.height / 2, false, map.params.zoomAnimate)
    })
    this.container.find('.vectormap-zoomout').click(function () {
      map.setScale(map.scale / map.params.zoomStep, map.width / 2, map.height / 2, false, map.params.zoomAnimate)
    })
  }

  createTip () {
    var map = this

    this.tip = jQuery('<div/>').addClass('vectormap-tip').appendTo(jQuery('body'))

    this.container.mousemove(function (e) {
      var left = e.pageX - 15 - map.tipWidth,
        top = e.pageY - 15 - map.tipHeight

      if (left < 5) {
        left = e.pageX + 15
      }
      if (top < 5) {
        top = e.pageY + 15
      }

      map.tip.css({
        left: left,
        top: top
      })
    })
  }

  setScale (scale, anchorX, anchorY, isCentered, animate) {
    var viewportChangeEvent = jQuery.Event('zoom.vectormap'),
      interval,
      that = this,
      i = 0,
      count = Math.abs(Math.round((scale - this.scale) * 60 / Math.max(scale, this.scale))),
      scaleStart,
      scaleDiff,
      transXStart,
      transXDiff,
      transYStart,
      transYDiff,
      transX,
      transY,
      deferred = new jQuery.Deferred()

    if (scale > this.params.zoomMax * this.baseScale) {
      scale = this.params.zoomMax * this.baseScale
    } else if (scale < this.params.zoomMin * this.baseScale) {
      scale = this.params.zoomMin * this.baseScale
    }

    if (typeof anchorX !== 'undefined' && typeof anchorY !== 'undefined') {
      var zoomStep = scale / this.scale
      if (isCentered) {
        transX = anchorX + this.defaultWidth * (this.width / (this.defaultWidth * scale)) / 2
        transY = anchorY + this.defaultHeight * (this.height / (this.defaultHeight * scale)) / 2
      } else {
        transX = this.transX - (zoomStep - 1) / scale * anchorX
        transY = this.transY - (zoomStep - 1) / scale * anchorY
      }
    }

    if (animate && count > 0) {
      scaleStart = this.scale
      scaleDiff = (scale - scaleStart) / count
      transXStart = this.transX * this.scale
      transYStart = this.transY * this.scale
      transXDiff = (transX * scale - transXStart) / count
      transYDiff = (transY * scale - transYStart) / count
      interval = setInterval(function () {
        i += 1
        that.scale = scaleStart + scaleDiff * i
        that.transX = (transXStart + transXDiff * i) / that.scale
        that.transY = (transYStart + transYDiff * i) / that.scale
        that.applyTransform()
        if (i == count) {
          clearInterval(interval)
          that.container.trigger(viewportChangeEvent, [scale / that.baseScale])
          deferred.resolve()
        }
      }, 10)
    } else {
      this.transX = transX
      this.transY = transY
      this.scale = scale
      this.applyTransform()
      this.container.trigger(viewportChangeEvent, [scale / this.baseScale])
      deferred.resolve()
    }

    return deferred
  }

  /**
   * Set the map's viewport to the specific point and set zoom of the map to the specific level. Point and zoom level could be defined in two ways: using the code of some region to focus on or a central point and zoom level as numbers.
   * @param This method takes a configuration object as the single argument. The options passed to it are the following:
   * @param {Array} params.regions Array of region codes to zoom to.
   * @param {String} params.region Region code to zoom to.
   * @param {Number} params.scale Map scale to set.
   * @param {Number} params.lat Latitude to set viewport to.
   * @param {Number} params.lng Longitude to set viewport to.
   * @param {Number} params.x Number from 0 to 1 specifying the horizontal coordinate of the central point of the viewport.
   * @param {Number} params.y Number from 0 to 1 specifying the vertical coordinate of the central point of the viewport.
   * @param {Boolean} params.animate Indicates whether or not to animate the scale change and transition.
   */
  setFocus (config) {
    var bbox,
      itemBbox,
      newBbox,
      codes,
      i,
      point

    config = config || {}

    if (config.region) {
      codes = [config.region]
    } else if (config.regions) {
      codes = config.regions
    }

    if (codes) {
      for (i = 0; i < codes.length; i++) {
        if (this.regions[codes[i]]) {
          itemBbox = this.regions[codes[i]].element.shape.getBBox()
          if (itemBbox) {
            if (typeof bbox === 'undefined') {
              bbox = itemBbox
            } else {
              newBbox = {
                x: Math.min(bbox.x, itemBbox.x),
                y: Math.min(bbox.y, itemBbox.y),
                width: Math.max(bbox.x + bbox.width, itemBbox.x + itemBbox.width) - Math.min(bbox.x, itemBbox.x),
                height: Math.max(bbox.y + bbox.height, itemBbox.y + itemBbox.height) - Math.min(bbox.y, itemBbox.y)
              }
              bbox = newBbox
            }
          }
        }
      }
      return this.setScale(
        Math.min(this.width / bbox.width, this.height / bbox.height),
        -(bbox.x + bbox.width / 2),
        -(bbox.y + bbox.height / 2),
        true,
        config.animate
      )
    } else {
      if (config.lat && config.lng) {
        point = this.latLngToPoint(config.lat, config.lng)
        config.x = this.transX - point.x / this.scale
        config.y = this.transY - point.y / this.scale
      } else if (config.x && config.y) {
        config.x *= -this.defaultWidth
        config.y *= -this.defaultHeight
      }
      return this.setScale(config.scale * this.baseScale, config.x, config.y, true, config.animate)
    }
  }

  getSelected (type) {
    var key,
      selected = []

    for (key in this[type]) {
      if (this[type][key].element.isSelected) {
        selected.push(key)
      }
    }
    return selected
  }

  /**
   * Return the codes of currently selected regions.
   * @returns {Array}
   */
  getSelectedRegions () {
    return this.getSelected('regions')
  }

  /**
   * Return the codes of currently selected markers.
   * @returns {Array}
   */
  getSelectedMarkers () {
    return this.getSelected('markers')
  }

  setSelected (type, keys) {
    var i

    if (typeof keys !== 'object') {
      keys = [keys]
    }

    if (jQuery.isArray(keys)) {
      for (i = 0; i < keys.length; i++) {
        this[type][keys[i]].element.setSelected(true)
      }
    } else {
      for (i in keys) {
        this[type][i].element.setSelected(!!keys[i])
      }
    }
  }

  /**
   * Set or remove selected state for the regions.
   * @param {String|Array|Object} keys If <code>String</code> or <code>Array</code> the region(s) with the corresponding code(s) will be selected. If <code>Object</code> was provided its keys are  codes of regions, state of which should be changed. Selected state will be set if value is true, removed otherwise.
   */
  setSelectedRegions (keys) {
    this.setSelected('regions', keys)
  }

  /**
   * Set or remove selected state for the markers.
   * @param {String|Array|Object} keys If <code>String</code> or <code>Array</code> the marker(s) with the corresponding code(s) will be selected. If <code>Object</code> was provided its keys are  codes of markers, state of which should be changed. Selected state will be set if value is true, removed otherwise.
   */
  setSelectedMarkers (keys) {
    this.setSelected('markers', keys)
  }

  clearSelected (type) {
    var select = {},
      selected = this.getSelected(type),
      i

    for (i = 0; i < selected.length; i++) {
      select[selected[i]] = false
    };

    this.setSelected(type, select)
  }

  /**
   * Remove the selected state from all the currently selected regions.
   */
  clearSelectedRegions () {
    this.clearSelected('regions')
  }

  /**
   * Remove the selected state from all the currently selected markers.
   */
  clearSelectedMarkers () {
    this.clearSelected('markers')
  }

  /**
   * Return the instance of Map. Useful when instantiated as a jQuery plug-in.
   * @returns {Map}
   */
  getMapObject () {
    return this
  }

  /**
   * Return the name of the region by region code.
   * @returns {String}
   */
  getRegionName (code) {
    return this.mapData.paths[code].name
  }

  createRegions () {
    var key,
      region,
      map = this

    this.regionLabelsGroup = this.regionLabelsGroup || this.canvas.addGroup()

    for (key in this.mapData.paths) {
      region = new Region({
        map: this,
        path: this.mapData.paths[key].path,
        code: key,
        style: jQuery.extend(true, {}, this.params.regionStyle),
        labelStyle: jQuery.extend(true, {}, this.params.regionLabelStyle),
        canvas: this.canvas,
        labelsGroup: this.regionLabelsGroup,
        label: this.params.labels && this.params.labels.regions
      })

      jQuery(region.shape).bind('selected', function (e, isSelected) {
        map.container.trigger('regionSelected.vectormap', [jQuery(this.node).attr('data-code'), isSelected, map.getSelectedRegions()])
      })
      this.regions[key] = {
        element: region,
        config: this.mapData.paths[key]
      }
    }
  }

  createMarkers (markers) {
    var i,
      marker,
      point,
      markerConfig,
      markersArray,
      map = this

    this.markersGroup = this.markersGroup || this.canvas.addGroup()
    this.markerLabelsGroup = this.markerLabelsGroup || this.canvas.addGroup()

    if (jQuery.isArray(markers)) {
      markersArray = markers.slice()
      markers = {}
      for (i = 0; i < markersArray.length; i++) {
        markers[i] = markersArray[i]
      }
    }

    for (i in markers) {
      markerConfig = markers[i] instanceof Array ? {latLng: markers[i]} : markers[i]
      point = this.getMarkerPosition(markerConfig)

      if (point !== false) {
        marker = new Marker({
          map: this,
          style: jQuery.extend(true, {}, this.params.markerStyle, {initial: markerConfig.style || {}}),
          labelStyle: jQuery.extend(true, {}, this.params.markerLabelStyle),
          index: i,
          cx: point.x,
          cy: point.y,
          group: this.markersGroup,
          canvas: this.canvas,
          labelsGroup: this.markerLabelsGroup,
          label: this.params.labels && this.params.labels.markers
        })

        jQuery(marker.shape).bind('selected', function (e, isSelected) {
          map.container.trigger('markerSelected.vectormap', [jQuery(this.node).attr('data-index'), isSelected, map.getSelectedMarkers()])
        })
        if (this.markers[i]) {
          this.removeMarkers([i])
        }
        this.markers[i] = {element: marker, config: markerConfig}
      }
    }
  }

  repositionMarkers () {
    var i,
      point

    for (i in this.markers) {
      point = this.getMarkerPosition(this.markers[i].config)
      if (point !== false) {
        this.markers[i].element.setStyle({cx: point.x, cy: point.y})
      }
    }
  }

  repositionLabels () {
    var key

    for (key in this.regions) {
      this.regions[key].element.updateLabelPosition()
    }

    for (key in this.markers) {
      this.markers[key].element.updateLabelPosition()
    }
  }

  getMarkerPosition (markerConfig) {
    if (maps[this.params.map].projection) {
      return this.latLngToPoint.apply(this, markerConfig.latLng || [0, 0])
    } else {
      return {
        x: markerConfig.coords[0] * this.scale + this.transX * this.scale,
        y: markerConfig.coords[1] * this.scale + this.transY * this.scale
      }
    }
  }

  /**
   * Add one marker to the map.
   * @param {String} key Marker unique code.
   * @param {Object} marker Marker configuration parameters.
   * @param {Array} seriesData Values to add to the data series.
   */
  addMarker (key, marker, seriesData) {
    var markers = {},
      data = [],
      values,
      i,
      seriesData = seriesData || []

    markers[key] = marker

    for (i = 0; i < seriesData.length; i++) {
      values = {}
      if (typeof seriesData[i] !== 'undefined') {
        values[key] = seriesData[i]
      }
      data.push(values)
    }
    this.addMarkers(markers, data)
  }

  /**
   * Add set of marker to the map.
   * @param {Object|Array} markers Markers to add to the map. In case of array is provided, codes of markers will be set as string representations of array indexes.
   * @param {Array} seriesData Values to add to the data series.
   */
  addMarkers (markers, seriesData) {
    var i

    seriesData = seriesData || []

    this.createMarkers(markers)
    for (i = 0; i < seriesData.length; i++) {
      this.series.markers[i].setValues(seriesData[i] || {})
    };
  }

  /**
   * Remove some markers from the map.
   * @param {Array} markers Array of marker codes to be removed.
   */
  removeMarkers (markers) {
    var i

    for (i = 0; i < markers.length; i++) {
      this.markers[ markers[i] ].element.remove()
      delete this.markers[ markers[i] ]
    };
  }

  /**
   * Remove all markers from the map.
   */
  removeAllMarkers () {
    var i,
      markers = []

    for (i in this.markers) {
      markers.push(i)
    }
    this.removeMarkers(markers)
  }

  /**
   * Converts coordinates expressed as latitude and longitude to the coordinates in pixels on the map.
   * @param {Number} lat Latitide of point in degrees.
   * @param {Number} lng Longitude of point in degrees.
   */
  latLngToPoint (lat, lng) {
    var point,
      proj = maps[this.params.map].projection,
      centralMeridian = proj.centralMeridian,
      inset,
      bbox

    if (lng < (-180 + centralMeridian)) {
      lng += 360
    }

    point = Proj[proj.type](lat, lng, centralMeridian)

    inset = this.getInsetForPoint(point.x, point.y)
    if (inset) {
      bbox = inset.bbox

      point.x = (point.x - bbox[0].x) / (bbox[1].x - bbox[0].x) * inset.width * this.scale
      point.y = (point.y - bbox[0].y) / (bbox[1].y - bbox[0].y) * inset.height * this.scale

      return {
        x: point.x + this.transX * this.scale + inset.left * this.scale,
        y: point.y + this.transY * this.scale + inset.top * this.scale
      }
    } else {
      return false
    }
  }

  /**
   * Converts cartesian coordinates into coordinates expressed as latitude and longitude.
   * @param {Number} x X-axis of point on map in pixels.
   * @param {Number} y Y-axis of point on map in pixels.
   */
  pointToLatLng (x, y) {
    var proj = maps[this.params.map].projection,
      centralMeridian = proj.centralMeridian,
      insets = maps[this.params.map].insets,
      i,
      inset,
      bbox,
      nx,
      ny

    for (i = 0; i < insets.length; i++) {
      inset = insets[i]
      bbox = inset.bbox

      nx = x - (this.transX * this.scale + inset.left * this.scale)
      ny = y - (this.transY * this.scale + inset.top * this.scale)

      nx = (nx / (inset.width * this.scale)) * (bbox[1].x - bbox[0].x) + bbox[0].x
      ny = (ny / (inset.height * this.scale)) * (bbox[1].y - bbox[0].y) + bbox[0].y

      if (nx > bbox[0].x && nx < bbox[1].x && ny > bbox[0].y && ny < bbox[1].y) {
        return Proj[proj.type + '_inv'](nx, -ny, centralMeridian)
      }
    }

    return false
  }

  getInsetForPoint (x, y) {
    var insets = maps[this.params.map].insets,
      i,
      bbox

    for (i = 0; i < insets.length; i++) {
      bbox = insets[i].bbox
      if (x > bbox[0].x && x < bbox[1].x && y > bbox[0].y && y < bbox[1].y) {
        return insets[i]
      }
    }
  }

  createSeries () {
    var i,
      key

    this.series = {
      markers: [],
      regions: []
    }

    for (key in this.params.series) {
      for (i = 0; i < this.params.series[key].length; i++) {
        this.series[key][i] = new DataSeries(
          this.params.series[key][i],
          this[key],
          this
        )
      }
    }
  }

  /**
   * Gracefully remove the map and and all its accessories, unbind event handlers.
   */
  remove () {
    this.tip.remove()
    this.container.remove()
    jQuery(window).unbind('resize', this.onResize)
    jQuery('body').unbind('mouseup', this.onContainerMouseUp)
  }
}

export var maps = {}

var defaultParams = {
  map: 'world_mill_en',
  backgroundColor: '#505050',
  zoomButtons: true,
  zoomOnScroll: true,
  zoomOnScrollSpeed: 3,
  panOnDrag: true,
  zoomMax: 8,
  zoomMin: 1,
  zoomStep: 1.6,
  zoomAnimate: true,
  regionsSelectable: false,
  markersSelectable: false,
  bindTouchEvents: true,
  regionStyle: {
    initial: {
      fill: 'white',
      'fill-opacity': 1,
      stroke: 'none',
      'stroke-width': 0,
      'stroke-opacity': 1
    },
    hover: {
      'fill-opacity': 0.8,
      cursor: 'pointer'
    },
    selected: {
      fill: 'yellow'
    },
    selectedHover: {
    }
  },
  regionLabelStyle: {
    initial: {
      'font-family': 'Verdana',
      'font-size': '12',
      'font-weight': 'bold',
      cursor: 'default',
      fill: 'black'
    },
    hover: {
      cursor: 'pointer'
    }
  },
  markerStyle: {
    initial: {
      fill: 'grey',
      stroke: '#505050',
      'fill-opacity': 1,
      'stroke-width': 1,
      'stroke-opacity': 1,
      r: 5
    },
    hover: {
      stroke: 'black',
      'stroke-width': 2,
      cursor: 'pointer'
    },
    selected: {
      fill: 'blue'
    },
    selectedHover: {
    }
  },
  markerLabelStyle: {
    initial: {
      'font-family': 'Verdana',
      'font-size': '12',
      'font-weight': 'bold',
      cursor: 'default',
      fill: 'black'
    },
    hover: {
      cursor: 'pointer'
    }
  }
}

var apiEvents = {
  onRegionTipShow: 'regionTipShow',
  onRegionOver: 'regionOver',
  onRegionOut: 'regionOut',
  onRegionClick: 'regionClick',
  onRegionSelected: 'regionSelected',
  onMarkerTipShow: 'markerTipShow',
  onMarkerOver: 'markerOver',
  onMarkerOut: 'markerOut',
  onMarkerClick: 'markerClick',
  onMarkerSelected: 'markerSelected',
  onViewportChange: 'viewportChange'
}
