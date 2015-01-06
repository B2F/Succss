
var SuccssDataCommon = {};

// Protocol prefix is optional.
SuccssDataCommon.url = 'succss.ifzenelse.net';

// Base screenshots path can be absolute or relative like below:
SuccssDataCommon.baseDirectory = './screenshots';

SuccssDataCommon.versionedPrefix = './self-';

SuccssDataCommon.previousCaptureFile = '';

SuccssDataCommon.test = function(capture, count) {

  // The callback has access to an object representing the capture after it's done.
  var page = capture.page;
  var viewport = capture.viewport;
  var options = capture.options;

  var expectedCapturePath = page.directory + '/' + this.setFileName(capture);
  var referenceScreenshot = expectedCapturePath.replace('./', SuccssDataCommon.versionedPrefix);

  casper.test.assertTruthy(capture.name, '- Captured "' + capture.file + '" file for ' + capture.selector + " selector");
  casper.test.assert(fs.exists(expectedCapturePath), '- On page "' + page.name + '" ' + page.url + ', in ' + page.directory + ' directory.');
  casper.test.assertTruthy(viewport, '- With viewport "' + viewport.name + '" having ' + viewport.width + " width and " + viewport.height + " height.");

  if(fs.size(capture.filePath) < 500) {
    casper.test.error('The size of the generated image is less than 500 octets.');
  }
  casper.test.assertNotEquals(capture.filePath, SuccssDataCommon.previousCaptureFile, 'The capture file path is different from previous capture.');
  SuccssDataCommon.previousCaptureFile = capture.filePath;

  casper.test.assertEquals(expectedCapturePath, capture.filePath, '"' + capture.page.name + '" path is ' + expectedCapturePath);

  casper.test.assertEquals(fs.size(referenceScreenshot), fs.size(expectedCapturePath), 'The captured image is correct.');
}

SuccssDataCommon.assertSuiteSuccess = function(count) {
  var currentCapture = count.planned - count.remaining;
  casper.test.assertTruthy(currentCapture, 'Capture n°' + currentCapture + ' done.');
  if (!count.remaining) {
    casper.test.assertTruthy(count.planned, 'Success! All tests passed.');
  }
}