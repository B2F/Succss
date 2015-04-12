/**
 * @file
 * This file is used by "npm test" to selftest the succss package.
 * Selftests are made from http://succss.ifzenelse.net documentation website.
 * 
 * This file, once ran with the 'succss check' command, will creates diff files
 * against base screenshots from "succss add selftests/data.js" and put them in
 * the directory "./selftests/diff-screenshots/".
 *
 * Diff types:
 *
 * - Text (header #dynamic-line)
 * - Image (#click-here)
 * - Color (body bgColor)
 * - Movement (aside#colors)
 *
 * @see selftests/run.sh
 * 
 */

phantom.injectJs('selftests/data.js');

// Replaces body's background-color #080 by #088
Succss.pages['advanced-selectors'].url.replace('bgColor=080', 'bgColor=088');
// Changing default headline (header #dynamic-line) to another one
Succss.pages['advanced-selectors'].url += '&headline=4';
// Removing before capture callbacks to keep movement and #click-here image.
for (var selector in Succss.pages['advanced-selectors'].captures) {
  Succss.pages['advanced-selectors'].captures[selector].before = undefined;
}
Succss.pages['diffCanvas'].captures['logoImg'].before = undefined;
Succss.pages['hiddenElements'].captures['navigation-menu'].hidden = undefined;

Succss.callback = function(capture) {

  if (capture.action == 'check') {

    casper.test.assertTruthy(fs.exists(capture.filePath), 'The updated capture was taken (' + capture.filePath + ').');
    if (capture.options.good) {
      casper.test.assertEquals(fs.size(capture.filePath), fs.size(capture.basePath), 'Base and update match.');
    }
    else {
      casper.test.assertNotEquals(fs.size(capture.filePath), fs.size(capture.basePath), 'Base and update are different in size.');
    }
  }
}

/**
 * Succss.options can take "default" options you would normally pass to the 
 * command line. Command line options take precedence.
 * 
 * @see http://succss.ifzenelse.net/commandline#options
 */
Succss.options = {
  // Disabling default imagediff behavior (inverting the casper test).
  'imagediff':false,
  'diffQuality':100,
  'exitOnError':false,
  'pages':'advanced-selectors',
}

/*
 * 
 * Overrides the default imagediff function, changing imgDiffPath and assertion.
 * 
 * @see http://succss.ifzenelse.net/customize#diff
 *
 */
Succss.diff = function(imgBase, imgCheck, capture) {

    phantom.injectJs(capture.options.libpath + '/imagediff.js');

    imgDiff = imagediff.diff(imgBase, imgCheck);
    var imagesMatch = imagediff.equal(imgBase, imgCheck, capture.options.tolerancePixels);

    if (!imagesMatch) {
      var filePath = capture.filePath.replace(/^.*\//, './selftests/diff-screenshots/');
      this.writeImgDiff(imgDiff, imgBase, imgCheck, filePath);
    }

    casper.test.assertFalse(imagesMatch, 'Capture is different to base screenshot (imagediff).');
    SuccssDataCommon.assertSuiteSuccess(capture.count);
}
