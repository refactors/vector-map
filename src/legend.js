import jQuery from 'jquery'
import { isImageUrl } from './jvectormap'

export default class Legend {
  /**
   * Represents map legend.
   * @constructor
   * @param {Object} params Configuration parameters.
   * @param {String} params.cssClass Additional CSS class to apply to legend element.
   * @param {Boolean} params.vertical If <code>true</code> legend will be rendered as vertical.
   * @param {String} params.title Legend title.
   * @param {Function} params.labelRender Method to convert series values to legend labels.
   */
  constructor (params) {
    this.params = params || {}
    this.map = this.params.map
    this.series = this.params.series
    this.body = jQuery('<div/>')
    this.body.addClass('jvectormap-legend')
    if (this.params.cssClass) {
      this.body.addClass(this.params.cssClass)
    }

    if (params.vertical) {
      this.map.legendCntVertical.append(this.body)
    } else {
      this.map.legendCntHorizontal.append(this.body)
    }

    this.render()
  }

  render () {
    var ticks = this.series.scale.getTicks()
    var i
    var inner = jQuery('<div/>').addClass('jvectormap-legend-inner')
    var tick
    var sample
    var label

    this.body.html('')
    if (this.params.title) {
      this.body.append(
        jQuery('<div/>').addClass('jvectormap-legend-title').html(this.params.title)
      )
    }
    this.body.append(inner)

    for (i = 0; i < ticks.length; i++) {
      tick = jQuery('<div/>').addClass('jvectormap-legend-tick')
      sample = jQuery('<div/>').addClass('jvectormap-legend-tick-sample')

      switch (this.series.params.attribute) {
        case 'fill':
          if (isImageUrl(ticks[i].value)) {
            sample.css('background', 'url(' + ticks[i].value + ')')
          } else {
            sample.css('background', ticks[i].value)
          }
          break
        case 'stroke':
          sample.css('background', ticks[i].value)
          break
        case 'image':
          sample.css('background', 'url(' + ticks[i].value + ') no-repeat center center')
          break
        case 'r':
          jQuery('<div/>').css({
            'border-radius': ticks[i].value,
            border: this.map.params.markerStyle.initial['stroke-width'] + 'px ' +
                    this.map.params.markerStyle.initial['stroke'] + ' solid',
            width: ticks[i].value * 2 + 'px',
            height: ticks[i].value * 2 + 'px',
            background: this.map.params.markerStyle.initial['fill']
          }).appendTo(sample)
          break
      }
      tick.append(sample)
      label = ticks[i].label
      if (this.params.labelRender) {
        label = this.params.labelRender(label)
      }
      tick.append(jQuery('<div>' + label + ' </div>').addClass('jvectormap-legend-tick-text'))
      inner.append(tick)
    }
    inner.append(jQuery('<div/>').css('clear', 'both'))
  }
}
