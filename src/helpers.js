import jQuery from 'jquery'

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
