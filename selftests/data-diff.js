
/**
 * @file
 * 
 * This file, once ran with the 'succss check' command, will creates diff files 
 * against base screenshots from data.js and put them in the directory 
 * ./self-screenshots/data-diff/.
 *
 * Diff types:
 *
 * - Text (header #dynamic-line)
 * - Image (#click-here)
 * - Color (body bgColor)
 * - Movement (aside#colors)
 * 
 */

phantom.injectJs(fs.workingDirectory + '/selftests/data.js');

// Replaces bgColor 080 by 088
Succss.pages['advanced-selectors'].url.replace('bgColor=080', 'bgColor=088');
// Changing default headline (header #dynamic-line) to another one
Succss.pages['advanced-selectors'].url += '&headline=4';
// Removing before capture callbacks to keep movement and #click-here image.
for (var selector in Succss.pages['advanced-selectors'].captures) {
  Succss.pages['advanced-selectors'].captures[selector].before = undefined;
}

Succss.callback = function(capture, countSuccss) {

  if (capture.action == 'check') {

    casper.test.assertNotEquals(capture.filePath, capture.basePath, 'The updated capture was taken.');
    casper.test.assertNotEquals(fs.size(capture.filePath), fs.size(capture.basePath), 'Base and update are different in size.');
    SuccssDataCommon.assertSuiteSuccess.call(this, countSuccss);
  }
}

Succss.options = {
  // Disabling default imagediff behavior (inverting the casper test).
  'imagediff':false,
  'exitOnError':false,
  'pages':'advanced-selectors'
}

/*
 * Overrides the default imagediff function, changing imgDiffPath and assertion.
 */
Succss.diff = function(imgBase, imgCheck) {

    phantom.injectJs('lib/imagediff.js');

    imgDiff = imagediff.diff(imgBase, imgCheck);
    var imagesMatch = imagediff.equal(imgBase, imgCheck, 0);
    if (!imagesMatch) {
      var canvas = imagediff.createCanvas();
      canvas.width = imgBase.width * 3;
      canvas.height = imgBase.height;
      var ctx = canvas.getContext('2d');
      ctx.putImageData(imgDiff, 0, 0);
      ctx.drawImage(imgBase, imgBase.width, 0);
      ctx.drawImage(imgCheck, imgBase.width*2, 0);
      var imgDiff = canvas.toDataURL("image/jpeg", 0.8).split(",")[1];
      var date = new Date();
      var imgDiffPath = this.filePath.replace('.succss-tmp/', './self-screenshots/data-diff/');
      fs.write(imgDiffPath.replace('png', 'jpeg'), atob(imgDiff),'wb');
    }
    casper.test.assertFalse(imagesMatch, 'Capture is different to base screenshot (imagediff).');
}