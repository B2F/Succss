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

exports.Succss = function() {

  /*
   * Try catching the initialisation phase, while parsing the javascript configuration data via self.
   * @see succss-bridge.js
   */
  try {

    var self = this;

    if (!self.casper) {
      throw "[SucCSS] Succss.casper instance missing.";
    }

    var casperInstance = self.casper;

    var fs = self.fs,
        options = self.allOptions,
        utils = self.utils,
        mouse = self.mouse,
        colorizer = self.colorizer;

    self.echo(options.action.charAt(0).toUpperCase() + options.action.slice(1) + 'ing ' + options.dataFile, 'INFO_BAR');

    if ((typeof self.getAllOptions == 'function') && options.verbose) {
      self.echo('[SucCSS] Options: ' + self.getAllOptions(), 'info');
    }

    if (!self.pages) {
      throw "[SucCSS] Succss.pages instance missing. See succss.ifzenelse.net";
    }
    var data = self.pages;

    // After capture callback.
    var after = self.afterCapture;

    var injectedJSFiles = [];

    var capturesFound = false,
        captureFilters = false;

    var viewportsData = self.viewports || { 
      'default': {
        'width':1366,
        'height':768
      }
    };

    var pages = Object.keys(data),
        viewports = Object.keys(viewportsData);

    // Directory path used as reference prefix when checking for differences.
    var checkDir = options.checkDir || '.succss-tmp';

    Object.keys(viewportsData).forEach(function(viewportName) {
      viewportsData[viewportName].name = viewportName;
      if (typeof viewportsData[viewportName].height != 'number' ||
          typeof viewportsData[viewportName].width != 'number') {
        throw "[SucCSS] The viewport height and width must be set with numbers.";
      }
    });
    if (options.verbose) {
      self.echo('Available viewports: ' + Object.keys(viewportsData).join(', '), 'INFO');
    }

    SuccssRecords.planned.pages = pages;
    SuccssRecords.planned.viewports = viewports;

  }
  catch (e) {
    self.echo(e + '\n', 'ERROR');
    self.exit(1);
  }

  /**
   * Handles "window.callPhantom" messages from casper.evaluate functions.
   */
  casperInstance.on('remote.callback', function(data) {

    // Calls utils.dump when window.callPhantm({dump:object}) is used:
    if (data.dump) {
      utils.dump(data.dump);
    }
    else {
      console.log(data);
    }
  });

  /**
   * Handles completed captures.
   */
  casperInstance.on('capture.complete', function(succeed, capture, message) {

  });

  /**
   * Handles completed CasperJs run events, when succss command has finished.
   */
  casperInstance.on('run.complete', function(data) {

  });

  // Default filenaming for captured screenshot files:
  if (!self.setFileName) self.setFileName = function(captureState) {
    return captureState.page.name + '--' + captureState.name + '--' + captureState.viewport.width + 'x' + captureState.viewport.height + '.png';
  };

  /**
   * Prepares a screenshot, then calls the after capture callback if it exists.
   * In case the "checkDir" option is used or during SlimerJs checking phase, screenshots capture will not occur.
   *
   * Note: SlimerJS engine is unable to check updates itself due to canvas writing issues.
   * So succss.py's adds an options.slimerCheck and starts with the 'add' command with PhantomJS taking captures
   * Then updates are checked with the previously made PhantomJS captures instead of live SlimerJs captures,
   * as if Slimer had made them because the default '.succss-tmp' directory is used.
   *
   * @param {Object} capture state
   */
  self.prepareScreenshot = function(capture) {

    // Sets the image reference path for searching image differences when 'succss check' is called:
    setCaptureReferenceFilePath(capture);

    // When 'succss check {config.js}' is called, screenshots images used for computing differences are either
    // written in '.succss-tmp' (the default checkDir value) or found in the path specified by --checkDir.
    // In case of slimerCheck, PhantomJs will capture updates in '.succss-tmp' with the 'add' action.
    if (capture.options.action == 'check'  || options.slimerCheck) {
      capture.filePath = SuccssCleanPreprendPath(checkDir, capture.page.directory+'/'+capture.file);
      capture.filePath = capture.filePath.replace(/\.\//, '');
    }

    // @see above SlimerJS engine notes.
    var slimerIsCheckingPhantomCaptures = (capture.options.action == 'check' && options.slimerCheck);

    // Screenshot taking happens with 'add' and normal 'check',
    // it doesn't take place with --checkDir or SlimerJs checks.
    if (!options.checkDir && !slimerIsCheckingPhantomCaptures) {
      self.takeScreenshot(capture);
    }

    casperInstance.then(function() {

      casperInstance.emit('capture.complete',
                         fs.exists(capture.filePath),
                         capture,
                         'Captured ' + capture.name + ' screenshot under ' + capture.filePath);
    });
  }

  self.list = function() {

    self.parseData(function(capture) {
      self.echo(capture.name + ' capture is valid.');
      casperInstance.emit('capture.complete', true);
    });
  }

  /*
   * The function that is executed with "succss add {config.js}"
   */
  self.add = function() {

    self.parseData(function(capture) {
      self.prepareScreenshot(capture);
    });
  }

  /**
   * The function that is executed with "succss check {config.js}"
   */
  self.check = function() {

    var command = function(capture) {

      self.prepareScreenshot(capture);

      casperInstance.then(function() {

        // Writing base and updated HTML images on PhantomJS canvas before passing them to a diff function.
        try {

          var imgLoadCount = 0;

          imgBase = new Image();
          imgCheck = new Image();
          imgBase.src = fs.absolute(capture.basePath);
          // Uses Math.Random() to reset browser's cache between pages requests,
          // useful when comapring pages, using same src for multiple checks.
          imgCheck.src = fs.absolute(capture.filePath+'?reset='+Math.random());

        }
        catch (err) {
          self.catchErrors(err);
        }

        imgBase.onerror = function(e) {
          var errorMsg = '[SucCSS] Base screenshot not found ("' + e.srcElement.src + '). Did you forget to add it ?\n';
          errorMsg += 'Check that the file path is a valid URI with no reserved ($ & + , / : ; = ? @) nor unsafe (" < > # % { } | \ ^ ~ [ ] `) characters.';
          self.catchErrors(errorMsg);
        }

        imgCheck.onerror = function(e) {
          var errorMsg = '[SucCSS] Current screenshot reference not found ("' + e.srcElement.src + '). Check your --checkDir option';
          self.catchErrors(errorMsg);
        }

        imgBase.onload = imgCheck.onload = function() {

          imgLoadCount++;
          if (imgLoadCount == 2) {
            ['imagediff', 'resemble', 'diff'].forEach(function(diff) {
              casperInstance.then(function() {
                try {
                  // Only calls diff methods enabled in Succss.options:
                  if (self[diff] && capture.options[diff] == true) {
                    self[diff](imgBase, imgCheck, capture);
                  }
                }
                catch (e) {
                  self.catchErrors(e);
                }
              });
            });
          }
        }
      });
    }
    self.parseData(command);
  }

  /**
   * The parseData function iterates through the pages, captures and viewports objects
   * generated from the javascript configuration during Succss private data initialisation phase.
   * Capture state objects are created for each iteration, then casperjs opens a webbrowser
   * and set the viewport for these. A command is called on each capture state (add, check).
   *
   * @param {Function} command functions from self.add and self.check above.
   * @returns casperInstance.run()
   */
  self.parseData = function(command) {

    casperInstance.start('about:blank', function() {

      casperInstance.each(pages, function(casperInstance, p) {

        if (options.verbose) {
          self.echo('\nFound "' + p + '" page configuration.', 'INFO');
        }

        casperInstance.each(data[p].captureKeys, function(casperInstance, c) {

          casperInstance.each(viewports, function(casperInstance, v) {

            casperInstance.thenOpen(data[p].url, function(){

              try {

                var capture = createCaptureState(p, v, c);

                if (options.verbose) {
                  self.echo('\nCapturing ' + capture.name + ' on page ' + capture.page.name + ', with ' + v + ' viewport:', 'INFO');
                  self.echo('Selector is: "' + capture.selector + '"', 'PARAMETER');
                  self.echo('> Opening ' + capture.page.url, 'PARAMETER');
                }
                casperInstance.viewport(capture.viewport.width, capture.viewport.height);

                // Throw on Client (4xx) or Server (5xx) errors.
                if (typeof casperInstance.currentHTTPStatus !== 'number' || casperInstance.currentHTTPStatus > 400) {
                  switch (casperInstance.currentHTTPStatus) {
                    case null:
                      throw "[SucCSS] Can't access " + capture.page.url + ". Check the website url and your internet connexion.";
                      break;
                    default:
                      throw "[SucCSS] Response code for " + capture.page.url + " was " + casperInstance.currentHTTPStatus;
                  }
                }

                command(capture);
              }
              catch(e) {
                self.catchErrors(e);
              }
            });
          });
        });
      });
    }).run();
  }

  /**
   * Captures a screenshot from the data contained in a Succss capture state object.
   *
   * @param {Object} capture state
   */
  self.takeScreenshot = function(captureState) {

    casperInstance.then(function() {
      casperInstance.waitForSelector(captureState.selector, function() {

        // Processing before capture callbacks:
        if (captureState.before) {
          // Siblings are before functions made available in other before functions,
          // see http://succss.ifzenelse.net/configuration#before.
          var siblings = {};
          var pageCaptures = data[captureState.page.name].captures;
          for (var c in pageCaptures) {
            if (c != captureState.name && pageCaptures[c].before) {
              siblings[c] = pageCaptures[c].before.bind(casperInstance, siblings);
            }
          }
          captureState.before.call(casperInstance, siblings);
        }
      }, function() {
        self.echo('Selector "' + captureState.selector + '" was not found anywhere on the page.', 'ERROR');
      });
    });

    // Processing the 'hidden' capture property:
    if (captureState.hidden) {
      var selectors = captureState.hidden;
      casperInstance.thenEvaluate(function(selectors) {
        var elements = document.querySelectorAll(selectors);
        for (var e in elements) {
          elements[e].style.visibility = 'hidden';
        }
      }, { selectors:selectors })
    };

    var imgOptions = {
      format: captureState.options.imgType,
      quality: captureState.options.imgQuality
    };

    // Takes the screenshot with CasperJs:
    casperInstance.then(function() {
      try {
        // Quickfix in case window.scrollTo is called on client side.
        // CasperJS getElementBounds does not do well on capture otherwise.
        casperInstance.evaluate(function() {
          window.scrollTo(0,0);
        })
        casperInstance.captureSelector(captureState.filePath, captureState.selector, imgOptions);
      }
      catch (err) {
        self.echo(err, 'ERROR');
        self.catchErrors(err);
      }
    });
  }

  /**
   * Hookable actions to be done before calling the 'capture.complete' event.
   * This hook is invoked when diff functions have finished.
   */
  if (!self.afterDiff) self.afterDiff = function(succeed, capture, diffType) {
    var message = 'Capture matches base screenshot (' + diffType + ')';
    casperInstance.emit('capture.complete', succeed, capture, message);
  }

  /**
   * Injects a javascript file with PhantomJs, only once.
   * @param {String} filePath
   */
  self.injectJs = function(filePath) {
    if (injectedJSFiles.indexOf(filePath) == -1) {
      var loaded = phantom.injectJs(filePath);
      if (loaded) {
        injectedJSFiles.push(filePath);
      }
      else {
        self.catchErrors('Unable to load script file: ' + filePath);
      }
    }
  }

  return self;
}