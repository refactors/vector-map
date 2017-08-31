import jQuery from 'jquery'
import 'jquery-mousewheel'

export var jvm = {
  inherits: function (child, parent) {
    function Temp () {}
    Temp.prototype = parent.prototype
    child.prototype = new Temp()
    child.prototype.constructor = child
    child.parentClass = parent
  },

  mixin: function (target, source) {
    var prop

    for (prop in source.prototype) {
      if (source.prototype.hasOwnProperty(prop)) {
        target.prototype[prop] = source.prototype[prop]
      }
    }
  },

  min: function (values) {
    var min = Number.MAX_VALUE
    var i

    if (values instanceof Array) {
      for (i = 0; i < values.length; i++) {
        if (values[i] < min) {
          min = values[i]
        }
      }
    } else {
      for (i in values) {
        if (values[i] < min) {
          min = values[i]
        }
      }
    }
    return min
  },

  max: function (values) {
    var max = Number.MIN_VALUE
    var i

    if (values instanceof Array) {
      for (i = 0; i < values.length; i++) {
        if (values[i] > max) {
          max = values[i]
        }
      }
    } else {
      for (i in values) {
        if (values[i] > max) {
          max = values[i]
        }
      }
    }
    return max
  },

  keys: function (object) {
    var keys = []
    var key

    for (key in object) {
      keys.push(key)
    }
    return keys
  },

  values: function (object) {
    var values = []
    var key
    var i

    for (i = 0; i < arguments.length; i++) {
      object = arguments[i]
      for (key in object) {
        values.push(object[key])
      }
    }
    return values
  },

  whenImageLoaded: function (url) {
    var deferred = new jvm.$.Deferred()
    var img = jvm.$('<img/>')

    img.error(function () {
      deferred.reject()
    }).load(function () {
      deferred.resolve(img)
    })
    img.attr('src', url)

    return deferred
  },

  isImageUrl: function (s) {
    return /\.\w{3,4}$/.test(s)
  }
}

export function whenImageLoaded (url) {
  var deferred = new jQuery.Deferred()
  var img = jQuery('<img/>')

  img.error(function () {
    deferred.reject()
  }).load(function () {
    deferred.resolve(img)
  })
  img.attr('src', url)

  return deferred
}

export function isImageUrl (s) {
  return /\.\w{3,4}$/.test(s)
}

jvm.$ = jQuery
