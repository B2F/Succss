/**
 * 
 * Succss module.
 *
 * The MIT License (MIT)
 * Copyright (c) 2015 ifzenelse.net
 *
 * @Author B2F
 *
 * @see succss.ifzenelse.net
 *
 */

exports.Succss = Succss;

SuccssCount = {
  planned:0,
  remaining:0,
  failures:0,
  startTime:0,
};

function Succss() {

  try {

    var self = this;

    if (!self.casper) {
      throw "[SucCSS] Succss.casper instance missing.";
    }
    var casperInstance = self.casper;

    if (!self.pages) {
      throw "[SucCSS] Succss.pages instance missing. See succss.ifzenelse.net";
    }
    var data = self.pages;

    var options = self.allOptions;

    // After capture callback.
    var after = self.callback;

    var pages = Object.keys(data);

    var capturesFound = false;
    var captureFilters = false;

    var viewportsData = self.viewports || { 
      'default': {
        'width':1366,
        'height':768
      }
    };
    var viewports = Object.keys(viewportsData);

    var createCaptureState = function(pageName, captureIndex, viewportName, action) {
      // Available in setFileName:
      captureState = data[pageName].captures[captureIndex];
      captureState.page = data[pageName];
      captureState.viewport = viewportsData[viewportName];
      captureState.options = options;
      captureState.count = SuccssCount;
      // Available in after capture callback:
      captureState.file = self.setFileName(captureState);
      captureState.basePath = captureState.page.directory + '/' + captureState.file;
      captureState.filePath = captureState.basePath;
      if (action == 'check') {
        captureState.filePath = options.tmpDir+'/'+captureState.page.directory+'/'+captureState.file;
      }
      captureState.action = action;
      return captureState;
    }

    var catchErrors = function(err) {
      casper.test.error(err);
      SuccssCount.failures++;
      if (SuccssCount.remaining == 0 && SuccssCount.failures) {
        casper.test.error('Tests failed with ' + SuccssCount.failures + ' errors.');
      }
    }

    if (!self.setFileName) self.setFileName = function(captureState) {
      return captureState.name + '--' + captureState.viewport.name + '-viewport.png';
    };

    if (options.pages != undefined) {
      pages = options.pages.split(',');
      console.log(colorizer.colorize('\n--pages option found, captures will only run for: ' + options.pages, 'WARNING'));
      for (var p in pages) {
        if(data[pages[p]] == undefined) {
          throw "[SucCSS] The page configuration " + pages[p] + ' was not found.';
        }
      }
    }

    if (options.captures != undefined) {
      captureFilters = options.captures.split(',');
      console.log(colorizer.colorize('\n--captures option found, captures will only run for: ' + options.captures, 'WARNING'));
    }
    if (options.viewports != undefined) {
      viewports = options.viewports.split(',');
      console.log(colorizer.colorize('\n--viewports option found, captures will only run with: ' + options.viewports + ' viewport.', 'WARNING'));
      for (var v in viewports) {
        if(viewportsData[viewports[v]] == undefined) {
          throw "[SucCSS] The viewport " + viewports[v] + " was not found.";
        }
      }
    }

    for (var p in pages) {

      var page = pages[p];
      data[page].name = page;

      if (data[page].url == undefined) {
        throw "[SucCSS] Each configuration page requires an url, see succss.ifzenelse.net example.";
      }
      if (data[page].url.indexOf('http') != 0) {
        data[page].url = 'http://' + data[page].url;
      }

      if (!data[page].directory) data[page].directory = './screenshots';

      if (data[page].captures == undefined || !Object.keys(data[page].captures).length) {
        data[page].captures = {
          'body':''
        }
      }

      var captures = data[page].captures;
      data[page].captureKeys = Array();

      for (var c in captures) {

        if (captureFilters == false || captureFilters.indexOf(c) != -1) {

          data[page].captureKeys.push(c);
          if (!captureFilters || captureFilters.indexOf(c) != -1) {
            capturesFound = true;
          }

          if (data[page].captures[c] instanceof Object) {
            data[page].captures[c] = {
              selector:captures[c].selector || c,
              before:captures[c].before || false
            };
          }
          else {
            data[page].captures[c] = {
              selector:captures[c] || c
            }
          }
          data[page].captures[c].name = c;
          data[page].captures[c].after = after;
        }
      }
    }

    if (!capturesFound) {
      throw "[SucCSS] No captures selector found. Check your Succss.pages configuration and filters.";
    }

    for (var v in viewportsData) {
      viewportsData[v].name = v;
      if (typeof viewportsData[v].height != 'number' || 
          typeof viewportsData[v].width != 'number') {
        throw "[SucCSS] The viewport height and width must be set with numbers.";
      }
    }
  }
  catch (e) {
    console.log(colorizer.colorize(e, 'ERROR') + '\n');
    casperInstance.exit();
  }

  self.add = function() {

    var command = function(capture) {

      console.log(colorizer.colorize('> ... Saving ' + capture.name + ' screenshot under ' + capture.filePath, 'PARAMETER'));
      self.takeScreenshot(casperInstance, capture);
    }
    self.parseData(command, 'add');
  }

  self.check = function() {

    var command = function(capture) {

      self.takeScreenshot(casperInstance, capture);

      casperInstance.then(function() {

        var imgLoadCount = 0;
        imgBase = new Image();
        if (fs.exists(capture.basePath)) {
          imgBase.src = fs.absolute(capture.basePath);
        }
        else {
          throw "[SucCSS] Base screenshot not found (" + capture.basePath + "). Did you forget to add it ?";
        }
        imgCheck = new Image();
        imgCheck.src = fs.absolute(capture.filePath);

        imgBase.onload = imgCheck.onload = function() {
          imgLoadCount++;
          if (imgLoadCount == 2) {
            ['imagediff', 'resemble', 'diff'].forEach(function(diff) {
              try {
                if (self[diff] && capture.options[diff] == true) {
                  self[diff].call(self, imgBase, imgCheck, capture);
                }
              }
              catch (e) {
                catchErrors(e);
              }
            });
          }
          if (!SuccssCount.remaining && ['.','./','/',undefined].indexOf(capture.options.tmpDir) == -1) {
              fs.removeTree(capture.options.tmpDir);
          }
        }
      });
   }
    self.parseData(command, 'check');
  }

  self.parseData = function(command, action) {

    casperInstance.start('about:blank', function() {

      var date = new Date();
      SuccssCount.startTime = date.getTime();

      casperInstance.each(pages, function(casperInstance, p) {

        if (action == 'add' && options.rmtree == true && fs.isDirectory(data[p].directory)) {
          console.log('\nWarning! ' + data[p].directory + " directory tree erased.");
          fs.removeTree(data[p].directory);
        }

        console.log(colorizer.colorize('\nFound "' + p + '" page configuration.', 'INFO'));

        SuccssCount.planned += data[p].captureKeys.length*viewports.length;
        SuccssCount.remaining = SuccssCount.planned;

        casperInstance.each(data[p].captureKeys, function(casperInstance, c) {

          casperInstance.each(viewports, function(casperInstance, v) {

            casperInstance.thenOpen(data[p].url, function(){

              SuccssCount.remaining--;

              var capture = createCaptureState(p, c, v, action);

              console.log(colorizer.colorize('\nCapturing "' + capture.page.name + '" ' + capture.name + ' screenshot with ' + v + ' viewport:', 'INFO'));
              console.log(colorizer.colorize('Selector is: "' + capture.selector + '"', 'PARAMETER'));
              console.log(colorizer.colorize('> Opening ' + capture.page.url, 'PARAMETER'));

              casperInstance.viewport(capture.viewport.width, capture.viewport.height);

              if (casperInstance.currentHTTPStatus != 200) {
                switch (casperInstance.currentHTTPStatus) {
                  case null:
                    throw "[SucCSS] Can't access " + capture.page.url + ". Check the website url and your internet connexion.";
                    break;
                  default:
                    throw "[SucCSS] Response code for " + capture.page.url + " was " + casperInstance.currentHTTPStatus;
                }
              }

              command(capture);

            });
          });
        });
      });
    }).run();
  }

  self.takeScreenshot = function(casper, captureState) {

    // Before capture:
    casper.then(function() {
      casper.waitForSelector(captureState.selector, function() {
        if (captureState.before) {
          var siblings = {};
          var pageCaptures = data[captureState.page.name].captures;
          for (var c in pageCaptures) {
            if (c != captureState.name && pageCaptures[c].before) {
              siblings[c] = pageCaptures[c].before.bind(casper, siblings);
            }
          }
          captureState.before.call(casper, siblings);
        }
      });
    });

    var imgOptions = {
      format: captureState.options.imgType,
      quality: captureState.options.imgQuality
    };

    casper.then(function() {

      casper.captureSelector(captureState.filePath, captureState.selector, imgOptions);

      // After capture:
      if (captureState.after != undefined) {
        try {
          captureState.after.call(self, captureState);
        }
        catch (err) {
          catchErrors(err);
        }
      }
    });
  }

  self.imagediff = function(imgBase, imgCheck, capture) {

    phantom.injectJs('lib/imagediff.js');

    imgDiff = imagediff.diff(imgBase, imgCheck);
    var imagesMatch = imagediff.equal(imgBase, imgCheck, capture.options.tolerancePixels);
    if (!imagesMatch) {
      var filePath = './imagediff/' + SuccssCount.startTime + '/' + capture.basePath.replace(/^\.?\//, '');
      self.writeImgDiff(imgDiff, imgBase, imgCheck, filePath);
    }
    casper.test.assertTrue(imagesMatch, 'Capture matches base screenshot.');
  }

  self.resemble = function(imgBase, imgCheck, capture) {

    phantom.injectJs('lib/resemble.js');

    var diff = resemble(imgBase.src).compareTo(imgCheck.src).onComplete(function(data){
      var imgDiff = new Image();
      imgDiff.src = data.getImageDataUrl();
      imgDiff.onload = function() {
        var filePath = './resemble/' + SuccssCount.startTime + '/' + capture.basePath.replace(/^\.?\//, '');
        self.writeImgDiff(imgDiff, imgBase, imgCheck, filePath);
      }
    });
  }

  self.writeImgDiff = function(imgDiff, imgBase, imgCheck, filePath) {
    var canvas = document.createElement('canvas');
    canvas.width = imgBase.width * 3;
    canvas.height = imgBase.height;
    var ctx = canvas.getContext('2d');
    var imgDiffType = imgDiff.toString();
    if (imgDiffType == '[object ImageData]') {
      ctx.putImageData(imgDiff, 0, 0);
    }
    else if (imgDiffType == '[object HTMLImageElement]') {
      ctx.drawImage(imgDiff, 0, 0);
    }
    else {
      throw 'Unable to write image diff file, unknwown diff image type (' + imgDiffType + ')';
    }
    ctx.drawImage(imgBase, imgBase.width, 0);
    ctx.drawImage(imgCheck, imgBase.width*2, 0);
    var data = canvas.toDataURL("image/jpeg", options.diffQuality/100).split(",")[1];
    fs.write(filePath.replace('png', 'jpeg'), atob(data),'wb');
  }

  return self;
}