/*
 * @file
 * Succss module containing js-imagediff, resemblejs and canvas compare implementations.
 *
 */

/**
 * Succss bundled diffing method for imagediff.js
 *
 * @param {HTMLImageElement} image reference
 * @param {HTMLImageElement} updated image
 * @param {Object} capture state
 */
exports.imagediff = function(imgBase, imgCheck, capture) {

  // the library loading is driver specific

  var imagediffOptions = {
    lightness:options.diffLightness,
    stack:options.diffStack,
    align:'top'
  }
  if (options.diffRGB != null) {
    imagediffOptions['rgb'] = options.diffRGB.split(',').map(function(x){return parseInt(x)});
  }
  var imagesMatch = imagediff.equal(imgBase, imgCheck, capture.options.toleranceInPixels);
  if (!imagesMatch) {
    var filePath = './succss-reports/imagediff/' + Succss.defaultDiffDirName(capture);
    var imgDiff = imagediff.diff(imgBase, imgCheck, imagediffOptions);
    Succss.writeImgDiff(imgDiff, imgBase, imgCheck, filePath);
    capture.differences.push({type: 'imagediff', file: filePath});
  }
  Succss.afterDiff(imagesMatch, capture, 'imagediff');
}

/**
 * Succss bundled diffing method for resemblejs
 *
 * @param {HTMLImageElement} image reference
 * @param {HTMLImageElement} updated image
 * @param {Object} capture state
 */
exports.resemble = function(imgBase, imgCheck, capture) {

  resemble(imgBase.src).compareTo(imgCheck.src).onComplete(function(data){

    var imgDiff = new Image();
    imgDiff.src = data.getImageDataUrl();
    imgDiff.onload = function() {

      try {
        var imagesMatch = !Math.round(data.misMatchPercentage);
        if (!imagesMatch) {
          var filePath = './succss-reports/resemble/' + Succss.defaultDiffDirName(capture);
          Succss.writeImgDiff(imgDiff, imgBase, imgCheck, filePath);
          capture.differences.push({type: 'resemble', file: filePath});
        }
        Succss.afterDiff(imagesMatch, capture, 'resemble');
      }
      catch (e) {
        Succss.catchErrors(e);
      }
    }
  });
}

/**
 * Writes an image to a HTML5 Canvas, assembled from images differences (imgDiff) between the original and updated images,
 * then saves it.
 *
 * @param {ImageData|HTMLImageElement} imgDiff The diff html image or image data output from any library: imagediff, resemble...
 * @param {HTMLImageElement} imgBase The original image.
 * @param {HTMLImageElement} imgCheck The updated image.
 * @param {String} filePath for saving the composed image.
 */
exports.writeImgDiff = function(imgDiff, imgBase, imgCheck, filePath) {

  var Succss = this;
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  var headerHeight = 50;
  var borderWidth = 1;
  if (options.compareCaptures) {
    if (imgBase.width < 150) {
      imgBase.width = 150;
    }
    if (imgBase.width < imgCheck.width) {
      imgBase.width = imgCheck.width;
    }
    if (imgBase.height < imgCheck.height) {
      imgBase.height = imgCheck.height;
    }
    canvas.width = imgBase.width * 3;
    canvas.height = imgBase.height + headerHeight;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000';
    ctx.font = "bold 35px Arial";
    // Drawing image reference:
    ctx.fillText("Base", imgBase.width + 10, headerHeight/1.4);
    ctx.beginPath();
    ctx.moveTo(imgBase.width, 0);
    ctx.lineTo(imgBase.width, headerHeight);
    ctx.lineTo(imgBase.width+borderWidth, headerHeight);
    ctx.lineTo(imgBase.width+borderWidth, 0);
    ctx.lineTo(imgBase.width, 0);
    ctx.fill();
    ctx.drawImage(imgBase, imgBase.width+borderWidth, headerHeight);
    // Drawing image update:
    ctx.fillText("Update", imgBase.width*2 + 10, headerHeight/1.4);
    ctx.beginPath();
    ctx.moveTo(imgBase.width*2, 0);
    ctx.lineTo(imgBase.width*2, headerHeight);
    ctx.lineTo(imgBase.width*2+borderWidth, headerHeight);
    ctx.lineTo(imgBase.width*2+borderWidth, 0);
    ctx.lineTo(imgBase.width*2, 0);
    ctx.fill();
    ctx.drawImage(imgCheck, (imgBase.width+borderWidth)*2, headerHeight);
    ctx.fillText("Diff", 10, headerHeight/1.4);
  }
  else {
    headerHeight = 0;
    canvas.width = imgDiff.width;
    canvas.height = imgDiff.height;
  }
  // Drawing image differences:
  var imgDiffType = imgDiff.toString();
  if (imgDiffType == '[object ImageData]') {
    ctx.putImageData(imgDiff, 0, headerHeight);
  }
  else if (imgDiffType == '[object HTMLImageElement]') {
    ctx.drawImage(imgDiff, 0, headerHeight);
  }
  else {
//    casper.test.error('Unable to write image diff file, unknown diff image type (' + imgDiffType + ')');
  }
  var data = canvas.toDataURL("image/jpeg", options.diffQuality/100).split(",")[1];
  fs.write(filePath, atob(data),'wb');
  Succss.echo('The diff image has been written in : ' + filePath, 'INFO');
}
