/**
 * @file
 */

/**
 * The Overrider pattern object.
 * @param {Array} excludes properties names
 * @returns {Overrider}
 */
exports.create = function(excludes) {
  var Overrider = function() {};
  Overrider.prototype.replaceWith = function(b) {
    for (var prop in b) {
      if (excludes.indexOf(prop) === -1) {
        this[prop] = b[prop];
      }
    }
  }
  return new Overrider;
}