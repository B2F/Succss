
var SuccssDataCommon = {};

// Protocol prefix is optional.
SuccssDataCommon.url = 'succss.ifzenelse.net';

// Base screenshots path can be absolute or relative like below:
SuccssDataCommon.baseDirectory = './screenshots';

SuccssDataCommon.versionedPrefix = './selftests/self-';

SuccssDataCommon.previousCaptureFile = '';

SuccssDataCommon.test = function(capture) {

  // The callback has access to an object representing the capture after it's done.
  var page = capture.page;
  var viewport = capture.viewport;
  var options = capture.options;

  var expectedCapturePath = page.directory + '/' + this.setFileName(capture);
  var referenceScreenshot = expectedCapturePath.replace('./', SuccssDataCommon.versionedPrefix);

  casper.test.assertTruthy(capture.name, '- Captured "' + capture.file + '" file for ' + capture.selector + " selector");
  casper.test.assert(this.fs.exists(expectedCapturePath), '- On page "' + page.name + '" ' + page.url + ', in ' + page.directory + ' directory.');
  casper.test.assertTruthy(viewport, '- With viewport "' + viewport.name + '" having ' + viewport.width + " width and " + viewport.height + " height.");

  casper.test.assertNotEquals(capture.filePath, SuccssDataCommon.previousCaptureFile, 'The capture file path is different from previous capture.');
  SuccssDataCommon.previousCaptureFile = capture.filePath;

  casper.test.assertEquals(expectedCapturePath, capture.filePath, '"' + capture.page.name + '" path is ' + expectedCapturePath);

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