/**
 * 
 * @file
 * 
 * @see demo.js
 * practical use case
 *
 */

exports.Succss = Succss;

SuccssCount = {
  planned:0,
  remaining:0,
  failures:0,
};

function Succss(options) {

  var self = this;

  if (!self.casper) {
    throw "[SucCSS] Succss.casper instance missing.";
  }
  var casperInstance = self.casper;

  if (!self.webpages) {
    throw "[SucCSS] Succss.webpages instance missing.";
  }
  var data = self.webpages;
  var options = options || {};
  // After capture callback.
  var acallback = self.callback;

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

  if(!self.setFileName) self.setFileName = function(captureState) {
    return captureState.name + '--' + captureState.viewport.name + '-viewport.png';
  };

  if (options.pages != undefined) {
    pages = options.pages.split(',');
    console.log ('Warning! --pages option found, captures will only run for: ' + options.pages);
    for (var p in pages) {
      if(data[pages[p]] == undefined) {
        throw "[SucCSS] The page configuration " + pages[p] + '" was not found.';
      }
    }
  }

  if (options.captures != undefined) {
    captureFilters = options.captures.split(',');
    console.log ('Warning! --captures option found, captures will only run for: ' + options.captures);
  }
  if (options.viewports != undefined) {
    viewports = options.viewports.split(',');
    console.log ('Warning! --viewports option found, captures will only run with: ' + options.viewports + ' viewport.');
    for (var v in viewports) {
      if(viewportsData[viewports[v]] == undefined) {
        throw "[SucCSS] The viewport " + viewports[v] + " was not found.";
      }
    }
  }

  for (var v in viewportsData) {
    viewportsData[v].name = v;
    // @TODO check viewports correctness.
  }

  for (var p in pages) {

    var page = pages[p];
    data[page].name = page;

    if (data[page].url == undefined) {
      throw "[SucCSS] Each configuration page requires an url, see ./regrecss/demo.js";
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
        data[page].captures[c].after = acallback;
      }
    }
  }

  if (!capturesFound) {
    throw "[SucCSS] No captures selector " + viewports[v] + " found. Check your Succss.webpages configuration.";
  }

  var createCaptureState = function(pageName, captureIndex, viewportName, action) {
    // Available in setFileName:
    captureState = data[pageName].captures[captureIndex];
    captureState.page = data[pageName];
    captureState.viewport = viewportsData[viewportName];
    captureState.options = options;
    // Available in after capture callback:
    captureState.file = self.setFileName(captureState);
    captureState.filePath = captureState.page.directory + '/' + captureState.file;
    captureState.action = action || 'add';
    return captureState;
  }

  self.add = function() {

    casperInstance.start('about:blank', function() {

      casperInstance.each(pages, function(casperInstance, p) {

        if (options.rmtree == true && fs.isDirectory(data[p].directory)) {
          console.log('\nWarning! ' + data[p].directory + " directory tree erased.");
          fs.removeTree(data[p].directory);
        }

        console.log('\nFound "' + p + '" page configuration.');

        SuccssCount.planned += data[p].captureKeys.length*viewports.length;
        SuccssCount.remaining = SuccssCount.planned;

        casperInstance.each(data[p].captureKeys, function(casperInstance, c) {

          casperInstance.each(viewports, function(casperInstance, v) {

            casperInstance.thenOpen(data[p].url, function(){

              SuccssCount.remaining--;

              var capture = createCaptureState(p, c, v);

              console.log('\nCapturing "' + capture.page.name + '" ' + capture.name + ' screenshot with ' + v + ' viewport:');
              console.log('\nSelector is: "' + capture.selector);
              console.log('> Opening ' + capture.page.url);

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

              console.log('> ... Saving ' + capture.name + ' screenshot under ' + capture.filePath);
              self.takeScreenshot(casperInstance, capture);

            });
          });
        });
      });
    }).run();
  }

  self.check = function() {

    casperInstance.start('about:blank', function() {

//      casperInstance.each(pages, function(casperInstance, k) {
//
//        casperInstance.each(data[k].sections, function(casperInstance, c) {
//
//          var section = data[k][c];
//
//          casperInstance.each(Object.keys(section.selectors), function(casperInstance, sel) {
//
//            casperInstance.each(Object.keys(data[k].viewports), function(casperInstance, v) {
//
//              var dir = section.screenDir + '/' + section.selectors[sel].name + '--' + v + '-viewport';
//              var checkDest = section.screenDir + '/tmp/' + section.selectors[sel].name + '--' + v + '-viewport';
//
//              casperInstance.thenOpen(section.targetPath, function(){
//
//                casperInstance.viewport(data[k].viewportsData[v].width, data[k].viewportsData[v].height);
//
//                if (casperInstance.currentHTTPStatus != 200) {
//                  throw "[SucCSS] Can't access " + section.targetPath + ". Check the website url and your internet connexion.";
//                }
//
//                Succss.takeScreenshot(casperInstance, checkDest, sel, section.selectors[sel].callback, afterCapture);
//
//                var imgLoadCount = 0;
//                imgBase = new Image();
//                imgBase.src = fs.absolute(dir);
//                imgCheck = new Image();
//                imgCheck.src = fs.absolute(checkDest);
//
//                imgBase.onload = imgCheck.onload = function() {
//                  imgLoadCount++;
//                  if (imgLoadCount == 2) {
//                    imgDiff = imagediff.diff(imgBase, imgCheck);
//                    console.log(imagediff.equal(imgBase, imgCheck));
//                    var canvas = imagediff.createCanvas();
//                    canvas.width = imgBase.width * 3;
//                    canvas.height = imgBase.height;
//                    var ctx = canvas.getContext('2d');
//                    ctx.putImageData(imgDiff, 0, 0);
//                    ctx.drawImage(imgBase, imgBase.width, 0);
//                    ctx.drawImage(imgCheck, imgBase.width*2, 0);
//                    var imgDiff = canvas.toDataURL("image/png").split(",")[1];
//                    var imgDiffPath = section.screenDir + '/imagediff' + 
//                    fs.write("file.png",atob(imgDiff),'wb');
//                  }
//                }
//
//              });
//            });
//          });
//        });
//      });
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
      format: 'png',
      quality: 80
    };

    casper.then(function() {

      casper.captureSelector(captureState.filePath, captureState.selector, imgOptions);

      // After capture:
      if (captureState.after != undefined) {
        try {
          captureState.after.call(self, captureState, SuccssCount);
        }
        catch (err) {
          casper.test.error(err);
          SuccssCount.failures++;
        }
      }
      if (SuccssCount.remaining == 0 && SuccssCount.failures) {
        casper.test.error('Your tests failed with ' + SuccssCount.failures + ' errors.');
      }
    });
  }

  self.diff = function(img1, img2) {
    
  }

  return self;

}