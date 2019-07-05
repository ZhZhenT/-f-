var Tween = {
  Linear: function (t, b, c, d) { return c * t / d + b; },
  Back: function (t, b, c, d, s) {
    if (s === undefined) s = 1.70158;
    return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
  },
  Quad: function (t, b, c, d) {
    return -c * (t /= d) * (t - 2) + b;
  },
  Quint: function (t, b, c, d) {
    return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
  }
}

module.exports = Tween;