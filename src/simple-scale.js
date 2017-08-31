import { jvm } from './jvectormap'

jvm.SimpleScale = function (scale) {
  this.scale = scale
}

jvm.SimpleScale.prototype.getValue = function (value) {
  return value
}
