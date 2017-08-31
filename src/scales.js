export class OrdinalScale {
  constructor (scale) {
    this.scale = scale
  }

  getValue (value) {
    return this.scale[value]
  }

  getTicks () {
    var ticks = []
    var key

    for (key in this.scale) {
      ticks.push({
        label: key,
        value: this.scale[key]
      })
    }

    return ticks
  }
}

export class SimpleScale {
  constructor (scale) {
    this.scale = scale
  }

  getValue (value) {
    return value
  }
}

export class NumericScale {
  constructor (scale, normalizeFunction, minValue, maxValue) {
    this.scale = []

    normalizeFunction = normalizeFunction || 'linear'

    if (scale) this.setScale(scale)
    if (normalizeFunction) this.setNormalizeFunction(normalizeFunction)
    if (typeof minValue !== 'undefined') this.setMin(minValue)
    if (typeof maxValue !== 'undefined') this.setMax(maxValue)
  }

  setMin (min) {
    this.clearMinValue = min
    if (typeof this.normalize === 'function') {
      this.minValue = this.normalize(min)
    } else {
      this.minValue = min
    }
  }

  setMax (max) {
    this.clearMaxValue = max
    if (typeof this.normalize === 'function') {
      this.maxValue = this.normalize(max)
    } else {
      this.maxValue = max
    }
  }

  setScale (scale) {
    var i

    this.scale = []
    for (i = 0; i < scale.length; i++) {
      this.scale[i] = [scale[i]]
    }
  }

  setNormalizeFunction (f) {
    if (f === 'polynomial') {
      this.normalize = function (value) {
        return Math.pow(value, 0.2)
      }
    } else if (f === 'linear') {
      delete this.normalize
    } else {
      this.normalize = f
    }
    this.setMin(this.clearMinValue)
    this.setMax(this.clearMaxValue)
  }

  getValue (value) {
    var lengthes = []
    var fullLength = 0
    var l
    var i = 0
    var c

    if (typeof this.normalize === 'function') {
      value = this.normalize(value)
    }
    for (i = 0; i < this.scale.length - 1; i++) {
      l = this.vectorLength(this.vectorSubtract(this.scale[i + 1], this.scale[i]))
      lengthes.push(l)
      fullLength += l
    }

    c = (this.maxValue - this.minValue) / fullLength
    for (i = 0; i < lengthes.length; i++) {
      lengthes[i] *= c
    }

    i = 0
    value -= this.minValue
    while (value - lengthes[i] >= 0) {
      value -= lengthes[i]
      i++
    }

    if (i == this.scale.length - 1) {
      value = this.vectorToNum(this.scale[i])
    } else {
      value = (
        this.vectorToNum(
          this.vectorAdd(this.scale[i],
            this.vectorMult(
              this.vectorSubtract(this.scale[i + 1], this.scale[i]),
              (value) / (lengthes[i])
            )
          )
        )
      )
    }

    return value
  }

  vectorToNum (vector) {
    var num = 0
    var i

    for (i = 0; i < vector.length; i++) {
      num += Math.round(vector[i]) * Math.pow(256, vector.length - i - 1)
    }
    return num
  }

  vectorSubtract (vector1, vector2) {
    var vector = []
    var i

    for (i = 0; i < vector1.length; i++) {
      vector[i] = vector1[i] - vector2[i]
    }
    return vector
  }

  vectorAdd (vector1, vector2) {
    var vector = []
    var i

    for (i = 0; i < vector1.length; i++) {
      vector[i] = vector1[i] + vector2[i]
    }
    return vector
  }

  vectorMult (vector, num) {
    var result = []
    var i

    for (i = 0; i < vector.length; i++) {
      result[i] = vector[i] * num
    }
    return result
  }

  vectorLength (vector) {
    var result = 0
    var i

    for (i = 0; i < vector.length; i++) {
      result += vector[i] * vector[i]
    }
    return Math.sqrt(result)
  }

  /* Derived from d3 implementation https://github.com/mbostock/d3/blob/master/src/scale/linear.js#L94 */
  getTicks () {
    var m = 5
    var extent = [this.clearMinValue, this.clearMaxValue]
    var span = extent[1] - extent[0]
    var step = Math.pow(10, Math.floor(Math.log(span / m) / Math.LN10))
    var err = m / span * step
    var ticks = []
    var tick
    var v

    if (err <= 0.15) step *= 10
    else if (err <= 0.35) step *= 5
    else if (err <= 0.75) step *= 2

    extent[0] = Math.floor(extent[0] / step) * step
    extent[1] = Math.ceil(extent[1] / step) * step

    tick = extent[0]
    while (tick <= extent[1]) {
      if (tick == extent[0]) {
        v = this.clearMinValue
      } else if (tick == extent[1]) {
        v = this.clearMaxValue
      } else {
        v = tick
      }
      ticks.push({
        label: tick,
        value: this.getValue(v)
      })
      tick += step
    }

    return ticks
  }
}

export class ColorScale extends NumericScale {
  constructor (colors, normalizeFunction, minValue, maxValue) {
    super()
  }

  setScale (scale) {
    var i

    for (i = 0; i < scale.length; i++) {
      this.scale[i] = rgbToArray(scale[i])
    }
  }

  getValue (value) {
    return numToRgb(super.getValue(value))
  }

  arrayToRgb (ar) {
    var rgb = '#'
    var d
    var i

    for (i = 0; i < ar.length; i++) {
      d = ar[i].toString(16)
      rgb += d.length === 1 ? '0' + d : d
    }
    return rgb
  }
}

function numToRgb (num) {
  num = num.toString(16)

  while (num.length < 6) {
    num = '0' + num
  }

  return '#' + num
}

function rgbToArray (rgb) {
  rgb = rgb.substr(1)
  return [parseInt(rgb.substr(0, 2), 16), parseInt(rgb.substr(2, 2), 16), parseInt(rgb.substr(4, 2), 16)]
}
