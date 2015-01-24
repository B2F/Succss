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

    var fs = self.fs;
    var options = self.allOptions;
    var utils = self.utils;
    var mouse = self.mouse;
    var colorizer = self.colorizer;

    self.echo('|-> ' + options.do + ' from file: ' + options.dataFile, 'INFO_BAR');

    if ((typeof self.getAllOptions == 'function')) {
      var logMsg = '[SucCSS] Options: ' + self.getAllOptions();
      self.casper.log(logMsg, 'info');
    }

    if (!self.pages) {
      throw "[SucCSS] Succss.pages instance missing. See succss.ifzenelse.net";
    }
    var data = self.pages;

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
      captureState.basePath = captureState.page.directory.replace(/\/$/, '') + '/' + captureState.file;
      captureState.filePath = captureState.basePath;
      if (action == 'check' || options.slimerCheck) {
        var checkPrefix = checkDir;
        if (!options.checkDir) {
          var uniqueDirId = captureState.page.name + '-' + captureState.viewport.name;
          checkPrefix = checkDir + '/' + uniqueDirId;
        }
        captureState.filePath = cleanPreprendPath(checkPrefix, captureState.page.directory+'/'+captureState.file);
        captureState.filePath = captureState.filePath.replace(/\.\//, '');
      }
      captureState.action = action;
      return captureState;
    }

    if (!self.setFileName) self.setFileName = function(captureState) {
      return captureState.page.name + '--' + captureState.name + '--' + captureState.viewport.name + '-viewport.png';
    };

    var checkDir = options.checkDir || '.succss-tmp';
    if (options.checkDir && !fs.isDirectory(checkDir)) {
      throw "[SucCSS] Reference directory not found. Check your --checkDir option.";
    }

    if (options.pages != undefined) {
      pages = options.pages.split(',');
      self.echo('\n--pages option found, captures will only run for <' + options.pages + '> pages.', 'WARNING');
      for (var p in pages) {
        if(data[pages[p]] == undefined) {
          throw "[SucCSS] The page configuration " + pages[p] + ' was not found.';
        }
      }
    }

    if (options.captures != undefined) {
      captureFilters = options.captures.split(',');
      self.echo('\n--captures option found, captures will only run for <' + options.captures + '>', 'WARNING');
    }
    if (options.viewports != undefined) {
      viewports = options.viewports.split(',');
      self.echo('\n--viewports option found, captures will only run with <' + options.viewports + '> viewport.', 'WARNING');
      for (var v in viewports) {
        if(viewportsData[viewports[v]] == undefined) {
          throw "[SucCSS] The viewport " + viewports[v] + " was not found.";
        }
      }
    }

    for (var p in pages) {

      var page = pages[p];
      data[page].name = page;

      if (data[page].source != undefined) {
        var source = data[page].source;
        if (data[source] == undefined) {
          throw "[SucCSS] Tried to copy unexisting " +  source + " to " + page;
        }
        function extendPage(origin, copy) {
          for (var prop in origin) {
            if (copy[prop] == undefined && origin[prop]) {
              copy[prop] = origin[prop];
            }
            else if (typeof(copy[prop]) == 'object') {
              copy[prop] = extendPage(origin[prop], copy[prop]);
            }
          }
          return copy;
        }
        data[page] = extendPage(data[source], data[page]);
      }

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
          if (typeof(data[page].captures[c]) == 'object') {
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

    for (var v in viewports) {
      var viewportName = viewports[v];
      viewportsData[viewportName].name = viewportName;
      if (typeof viewportsData[viewportName].height != 'number' ||
          typeof viewportsData[viewportName].width != 'number') {
        throw "[SucCSS] The viewport height and width must be set with numbers.";
      }
    }
  }
  catch (e) {
    self.echo(e + '\n', 'ERROR');
    casperInstance.exit();
  }

  casperInstance.on('remote.callback', function(data) {

    if (data.dump) {
      utils.dump(data.dump);
    }
    else {
      console.log(data);
    }
  });

  casperInstance.on('run.complete', function(data) {
    if (SuccssCount.failures) {
      self.echo('Tests failed with ' + SuccssCount.failures + ' errors.', 'ERROR');
    }
    else {
      self.echo('[SUCCSS] All captures (' + SuccssCount.planned + ') tests pass!', 'GREEN_BAR');
    }
  });

  self.add = function() {

    var command = function(capture) {

      self.echo('> ... Saving ' + capture.name + ' screenshot under ' + capture.filePath, 'PARAMETER');
      self.takeScreenshot(casperInstance, capture);
    }
    self.parseData(command, 'add');
  }

  self.check = function() {

    var command = function(capture) {

      if (!options.checkDir && !options.slimerCheck) {
        self.takeScreenshot(casperInstance, capture);
      }

      casperInstance.then(function() {

        try {

          // After capture or on checkDir:
          if (capture.after != undefined) {
            try {
              capture.after.call(self, capture);
            }
            catch (err) {
              self.catchErrors(err);
            }
          }

          var imgLoadCount = 0;
          if (fs.exists(capture.basePath)) {
            imgBase = new Image();
            imgBase.src = fs.absolute(capture.basePath);
          }
          else {
            throw "[SucCSS] Base screenshot not found (" + capture.basePath + "). Did you forget to add it ?";
          }
          if (fs.exists(capture.filePath)) {
            imgCheck = new Image();
            imgCheck.src = fs.absolute(capture.filePath);
          }
          else {
            throw "[SucCSS] Screenshot reference not found (" + capture.filePath + "). Check your --checkDir option.";
          }
        }
        catch (err) {
          self.catchErrors(err);
        }

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
                self.catchErrors(e);
              }
            });
            if (!SuccssCount.remaining) {
              if (!options.checkDir && !SuccssCount.remaining) {
                fs.removeTree(checkDir);
              }
            }
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
          self.echo('\nWarning! ' + data[p].directory + " directory tree erased.", 'WARNING');
          fs.removeTree(data[p].directory);
        }

        self.echo('\nFound "' + p + '" page configuration.', 'INFO');

        SuccssCount.planned += data[p].captureKeys.length*viewports.length;
        SuccssCount.remaining = SuccssCount.planned;

        casperInstance.each(data[p].captureKeys, function(casperInstance, c) {

          casperInstance.each(viewports, function(casperInstance, v) {

            casperInstance.thenOpen(data[p].url, function(){

              SuccssCount.remaining--;

              var capture = createCaptureState(p, c, v, action);

              self.echo('\nCapturing "' + capture.page.name + '" ' + capture.name + ' screenshot with ' + v + ' viewport:', 'INFO');
              self.echo('Selector is: "' + capture.selector + '"', 'PARAMETER');
              self.echo('> Opening ' + capture.page.url, 'PARAMETER');

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
      }, function() {
        self.echo('Selector "' + captureState.selector + '" was not found anywhere on the page.', 'ERROR');
      });
    });

    var imgOptions = {
      format: captureState.options.imgType,
      quality: captureState.options.imgQuality
    };

    casper.then(function() {
      try {
        // Quickfix in case window.scrollTo is called on client side.
        // CasperJS getElementBounds does not do well on capture otherwise.
        casper.evaluate(function() {
          window.scrollTo(0,0);
        })
        casper.captureSelector(captureState.filePath, captureState.selector, imgOptions);
      }
      catch (err) {
        self.echo(err, 'ERROR');
        self.catchErrors(err);
      }
    });
  }

  self.imagediff = function(imgBase, imgCheck, capture) {

    phantom.injectJs('lib/imagediff.js');

    var imagesMatch = imagediff.equal(imgBase, imgCheck, capture.options.tolerancePixels);
    if (!imagesMatch) {
      var filePath = './imagediff/' + SuccssCount.startTime + '/' + capture.filePath.replace(/^\.?\//, '').replace(checkDir+'/', '');
      var imgDiff = imagediff.diff(imgBase, imgCheck);
      self.writeImgDiff(imgDiff, imgBase, imgCheck, filePath);
    }
    casper.test.assertTrue(imagesMatch, 'Capture matches base screenshot (imagediff).');
  }

  self.resemble = function(imgBase, imgCheck, capture) {

    phantom.injectJs('lib/resemble.js');

    resemble(imgBase.src).compareTo(imgCheck.src).onComplete(function(data){
      var imgDiff = new Image();
      imgDiff.src = data.getImageDataUrl();
      imgDiff.onload = function() {
        try {
          var imagesMatch = !Math.round(data.misMatchPercentage);
          if (!imagesMatch) {
            var filePath = './resemble/' + SuccssCount.startTime + '/' + capture.filePath.replace(/^\.?\//, '').replace(checkDir+'/', '');
            self.writeImgDiff(imgDiff, imgBase, imgCheck, filePath);
          }
          casper.test.assertTrue(imagesMatch, 'Capture matches base screenshot (resemble).');
        }
        catch (e) {
          self.catchErrors(e);
        }
      }
    });
  }

  self.writeImgDiff = function(imgDiff, imgBase, imgCheck, filePath) {
    var canvas = document.createElement('canvas');
    var headerHeight = 50;
    var borderWidth = 1;
    if (imgBase.width < 150) {
      imgBase.width = 150;
    }
    if (imgBase.width < imgCheck.width) {
      imgBase.width = imgCheck.width;
    }
    canvas.width = imgBase.width * 3;
    canvas.height = imgBase.height + headerHeight;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.moveTo(imgBase.width, 0);
    ctx.lineTo(imgBase.width, headerHeight);
    ctx.lineTo(imgBase.width+borderWidth, headerHeight);
    ctx.lineTo(imgBase.width+borderWidth, 0);
    ctx.lineTo(imgBase.width, 0);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(imgBase.width*2, 0);
    ctx.lineTo(imgBase.width*2, headerHeight);
    ctx.lineTo(imgBase.width*2+borderWidth, headerHeight);
    ctx.lineTo(imgBase.width*2+borderWidth, 0);
    ctx.lineTo(imgBase.width*2, 0);
    ctx.fill();
    var imgDiffType = imgDiff.toString();
    if (imgDiffType == '[object ImageData]') {
      ctx.putImageData(imgDiff, 0, headerHeight);
    }
    else if (imgDiffType == '[object HTMLImageElement]') {
      ctx.drawImage(imgDiff, 0, headerHeight);
    }
    else {
      throw 'Unable to write image diff file, unknown diff image type (' + imgDiffType + ')';
    }
    ctx.drawImage(imgBase, imgBase.width+borderWidth, headerHeight);
    ctx.drawImage(imgCheck, (imgBase.width+borderWidth)*2, headerHeight);
    ctx.font = "bold 35px Arial";
    ctx.fillText("Diff", 10, headerHeight/1.4);
    ctx.fillText("Base", imgBase.width + 10, headerHeight/1.4);
    ctx.fillText("Update", imgBase.width*2 + 10, headerHeight/1.4);
    var data = canvas.toDataURL("image/jpeg", options.diffQuality/100).split(",")[1];
    fs.write(filePath.replace('png', 'jpeg'), atob(data),'wb');
    self.echo('The diff image has been written in : ' + filePath, 'INFO');
  }

  self.catchErrors = function(err) {
    SuccssCount.failures++;
    casper.test.error(err);
  }

  return self;
}

function cleanPreprendPath(path, dir) {
  return path.replace(/\/$/, '') + '/' + dir.replace(/^(\.\/|\/)/, '');
}
