/**
 * @file
 * Set of common variables and methods used across the selftests suite.
 * 
 */

var SuccssDataCommon = {};

// Protocol prefix is optional.
SuccssDataCommon.url = 'succss.ifzenelse.net';

// Base screenshots path can be absolute or relative like below:
SuccssDataCommon.baseDirectory = './screenshots';

SuccssDataCommon.previousCaptureFile = '';

SuccssDataCommon.test = function(capture) {

  // The callback has access to an object representing the capture after it's done.
  var viewport = capture.viewport;

  var expectedCapturePath = capture.page.directory + '/' + this.setFileName(capture);

  if (expectedCapturePath != capture.filePath) {
    this.catchErrors('Unexpected capture path (' + capture.filePath + '). Expected path is '+ expectedCapturePath);
  }

  casper.test.assertTruthy(capture.name, '- Captured "' + capture.file + '" file for ' + capture.selector + " selector");
  casper.test.assertTruthy(this.fs.exists(expectedCapturePath), '- Capture file exists (' + expectedCapturePath + ')');
  casper.test.assertTruthy(viewport, '- With viewport "' + viewport.name + '" having ' + viewport.width + " width and " + viewport.height + " height.");

  casper.test.assertNotEquals(capture.filePath, SuccssDataCommon.previousCaptureFile, 'The capture file path is different from previous capture.');
  SuccssDataCommon.previousCaptureFile = capture.filePath;

  // slimerjs does not seem to support fs.size, at least on some browsers versions.
  if (this.allOptions.engine != 'slimerjs') {

    if(fs.size(capture.filePath) < 500) {
      this.echo('The size of the generated image is less than 500 octets.', 'WARNING');
    }
  }
}

SuccssDataCommon.assertSuiteSuccess = function(count) {
  var currentCapture = count.planned - count.remaining;
  casper.test.assertTruthy(currentCapture, 'Capture n°' + currentCapture + ' done.');
  if (!count.remaining) {
    casper.test.assertTruthy(count.planned, 'Success! All tests passed.');
  }
}