/**
 * @file
 */

/**
 * @param {object} cliArgs
 * @param {object} fileArgs
 * @returns {object} list of cli plus file options merged together.
 */
exports.merge = function(cliArgs, fileArgs) {

  var allArgs = {
    driver:'casperjs',
    imgType:'png',
    imgQuality:'80',
    diff:true,
    imagediff:true,
    resemble:false,
    diffQuality:'70',
    toleranceInPixels:'0',
    diffLightness:125,
    diffStack:false,
    compareCaptures:true,
    report:true
  };

  // 1, load options from configuration file:
  for (var opt in fileArgs) {
    allArgs[opt] = fileArgs[opt];
  }
  // 2. then override 1. with options for a specific action ('add', 'check'...):
  if (fileArgs && fileArgs[cliArgs.action]) {
    for (var opt in fileArgs[cliArgs.action]) {
      allArgs[opt] = fileArgs[cliArgs.action][opt];
    }
  }
  // Finally override 2. with commandline options:
  for (var opt in cliArgs) {
    allArgs[opt] = cliArgs[opt];
  }

  return allArgs;
}

/**
 * Converts nodejs CLI arguments into a Succss options object.
 */
exports.argvToObject = function(argv) {
  var o = {};
  var aliases = {
    '-p' : '--pages',
    '-v' : '--viewports',
    '-c' : '--captures',
    '-ctp' : '--compareToPage',
    '-ctv' : '--compareToViewport'
  };
  if (argv.length > 1) {
    o.action = argv[0];
    o.configFilePath = argv[1];
    for (var i in argv) {
      var regex = /--(\w*)(=.*)?$/g;
      var match = regex.exec(argv[i]);
      if (match) {
        typeof match[2] === 'undefined' ? o[match[1]] = true : o[match[1]] = match[2].slice(1);
      }
      else if (aliases[argv[i]]) {
        var name = aliases[argv[i]]
        var value = argv[parseInt(i)+1];
        o[name] = value;
      }
    }
  }
  return o;
}

/**
 * Converts a Succss options object to a nodejs CLI arguments array.
 */
exports.objectToArgv = function(o) {
  var a = [];
  for (var prop in o) {
    a.push('--' + prop + '=' + o[prop]);
  }
  return a;
}
