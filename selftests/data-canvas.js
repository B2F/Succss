/**
 * @file
 * This file is used by "npm test" to selftest the succss package.
 * Selftests are made from http://succss.ifzenelse.net documentation website.
 * 
 * Uses a custom diff method with various output canvas settings.
 * 
 * @see selftests/run.sh, selftests/test.sh
 *
 */

// Includes another javascript file from the command line working directory.
phantom.injectJs('selftests/data-diff.js');

/**
 * Succss.options can take "default" options you would normally pass to the 
 * command line. Command line options take precedence.
 * 
 * @see http://succss.ifzenelse.net/commandline#options
 */
Succss.options = {
  // Disabling default imagediff behavior (inverting the casper test).
  'imagediff':true,
  'diff':false,
  'diffQuality':100,
  'exitOnError':false,
  'check': {
    'pages': 'diffCanvas'
  }
}

Succss.diff = function(imgBase, imgCheck, capture) {

    this.injectJs(capture.options.libpath + '/resemble.js');

    resemble.outputSettings({
      errorColor: {
        red: 10,
        green: 255,
        blue: 255
      },
      transparency: 1,
      largeImageThreshold: 0
    });

    this.resemble(imgBase, imgCheck, capture);
}

/**
 * Hookable actions to be done before calling the 'capture.complete' event.
 * This hook is invoked when diff functions have finished.
 *
 * Compares different diffing methods outputs to screenshots references.
 *
 */
Succss.afterDiff = function(succeed, capture, diffType) {
  var currentCapturePath = './succss-reports/' + diffType + '/' + this.defaultDiffDirName(capture);
  var referencePath = null;
  // default options:
  if (this.allOptions.imagediffDefaults) {
    referencePath = 'selftests/static-images/imagediff-defaults/diffCanvas-logoImg-640x480.png';
  }
  // increased lightness:
  if (this.allOptions.imagediffLightness) {
    referencePath = 'selftests/static-images/imagediff-lightness/diffCanvas-logoImg-640x480.png';
  }
  // custom imagediff settings:
  if (this.allOptions.imagediffCustom) {
    referencePath = 'selftests/static-images/imagediff-custom/diffCanvas-logoImg-640x480.png';
  }
  // custom resemblejs settings:
  if (this.allOptions.resembleSettings) {
    referencePath = 'selftests/static-images/resemble-custom/diffCanvas-logoImg-640x480.png';
  }
  if (!referencePath) throw('data-canvas.js must be run with either --imagediffDefaults, --imagediffLightness, --imagediffCustom or --resembleSettings.');
  this.casper.test.assertEquals(fs.size(currentCapturePath), fs.size(referencePath), 'The diff screenshot is correct.');
  var message = 'Capture is different to base screenshot (' + diffType + ').';
  this.casper.emit('capture.complete', !succeed, capture, message);
}