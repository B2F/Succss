
var succss = require(casper.cli.options.npmpath + '/lib/succss/Succss').create(casper.cli.options);

  /**
   * Handles "window.callPhantom" messages from casper.evaluate functions.
   */
  casper.on('remote.callback', function(data) {
    succss.echo(data);
  });

  /**
   * Handles completed captures.
   */
  casper.on('capture.complete', function(succeed, capture, message) {
    succss.completeCapture(succeed, capture, message);
    console.log(message);
//    try {
////      casper.test.assertTrue(succeed, message);
//    }
//    catch(e) {
//      succss.catchErrors(e);
//    }
  });

  /**
   * Handles completed CasperJs run events, when succss command has finished.
   */
  casper.on('run.complete', function(data) {
    succss.completeRun();
  });

/**
 * Prepares a screenshot, then calls the after capture callback if it exists.
 * In case the "checkDir" option is used or during SlimerJs checking phase, screenshots capture will not occur.
 *
 * Note: SlimerJS engine is unable to check updates itsuccss due to canvas writing issues.
 * So succss.py's adds an options.slimerCheck and starts with the 'add' command with PhantomJS taking captures
 * Then updates are checked with the previously made PhantomJS captures instead of live SlimerJs captures,
 * as if Slimer had made them because the default '.succss-tmp' directory is used.
 *
 * @param {Object} capture state
 */
succss.prepareScreenshot = function(capture) {

  // Sets the image reference path for searching image differences when 'succss check' is called:
  this.setCaptureReferenceFilePath(capture);

  // When 'succss check {config.js}' is called, screenshots images used for computing differences are either
  // written in '.succss-tmp' (the default checkDir value) or found in the path specified by --checkDir.
  // In case of slimerCheck, PhantomJs will capture updates in '.succss-tmp' with the 'add' action.
  if (capture.options.action == 'check'  || succss.options.slimerCheck) {
    var rootScreenDir = succss.options.checkDir || succss.options.tmpDir;
    capture.filePath = SuccssCleanPreprendPath(rootScreenDir, capture.page.directory+'/'+capture.file);
    capture.filePath = capture.filePath.replace(/\.\//, '');
  }

  // @see above SlimerJS engine notes.
  var slimerIsCheckingPhantomCaptures = (capture.options.action == 'check' && succss.options.slimerCheck);

  // Screenshot taking happens with 'add' and normal 'check',
  // it doesn't take place with --checkDir or SlimerJs checks.
  if (!succss.options.checkDir && !slimerIsCheckingPhantomCaptures) {
    succss.takeScreenshot(capture);
  }

  casper.then(function() {

    casper.emit('capture.complete',
                       succss.fs.exists(capture.filePath),
                       capture,
                       'Captured ' + capture.name + ' screenshot under ' + capture.filePath);
  });
}

/*
 * The function that is executed with "succss add {config.js}"
 */
succss.add = function(capture) {
  succss.prepareScreenshot(capture);
}

/**
 * The function that is executed with "succss check {config.js}"
 */
succss.check = function(capture) {

  succss.prepareScreenshot(capture);

  casper.then(function() {

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
      succss.catchErrors(err);
    }

    imgBase.onerror = function(e) {
      var errorMsg = '[SucCSS] Base screenshot not found ("' + e.srcElement.src + '). Did you forget to add it ?\n';
      errorMsg += 'Check that the file path is a valid URI with no reserved ($ & + , / : ; = ? @) nor unsafe (" < > # % { } | \ ^ ~ [ ] `) characters.';
      succss.catchErrors(errorMsg);
    }

    imgCheck.onerror = function(e) {
      var errorMsg = '[SucCSS] Current screenshot reference not found ("' + e.srcElement.src + '). Check your --checkDir option';
      succss.catchErrors(errorMsg);
    }

    imgBase.onload = imgCheck.onload = function() {

      imgLoadCount++;
      if (imgLoadCount == 2) {
        ['imagediff', 'resemble', 'diff'].forEach(function(diff) {
          casper.then(function() {
            try {
              // Only calls diff methods enabled in Succss.options:
              if (succss[diff] && capture.options[diff] == true) {
                succss[diff](imgBase, imgCheck, capture);
              }
            }
            catch (e) {
              succss.catchErrors(e);
            }
          });
        });
      }
    }
  });
}

/**
 * The parseData function iterates through the pages, captures and viewports objects
 * generated from the javascript configuration during Succss private data initialisation phase.
 * Capture state objects are created for each iteration, then casperjs opens a webbrowser
 * and set the viewport for these. A command is called on each capture state (add, check).
 *
 * @param {Function} command functions from succss.add and succss.check above.
 * @returns casper.run()
 */
succss.parseData = function(command) {

  casper.start('about:blank', function() {

    casper.each(succss.records.planned.pages, function(casper, p) {

//      if (options.verbose) {
        succss.echo('\nFound "' + p + '" page configuration.', 'INFO');
//      }

      casper.each(succss.pages[p].captureKeys, function(casper, c) {

        casper.each(succss.records.planned.viewports, function(casper, v) {

          casper.thenOpen(succss.pages[p].url, function(){

            try {

              var capture = succss.createCaptureState(p, v, c);

//              if (succss.options.verbose) {
                succss.echo('\nCapturing ' + capture.name + ' on page ' + capture.page.name + ', with ' + v + ' viewport:', 'INFO');
                succss.echo('Selector is: "' + capture.selector + '"', 'PARAMETER');
                succss.echo('> Opening ' + capture.page.url, 'PARAMETER');
//              }
              casper.viewport(capture.viewport.width, capture.viewport.height);

              // Throw on Client (4xx) or Server (5xx) errors.
              if (typeof casper.currentHTTPStatus !== 'number' || casper.currentHTTPStatus > 400) {
                switch (casper.currentHTTPStatus) {
                  case null:
                    throw "[SucCSS] Can't access " + capture.page.url + ". Check the website url and your internet connexion.";
                    break;
                  default:
                    throw "[SucCSS] Response code for " + capture.page.url + " was " + casper.currentHTTPStatus;
                }
              }

              command(capture);
            }
            catch(e) {
              succss.catchErrors(e);
            }
          });
        });
      });
    });
//  });
  }).run();
}

/**
 * Captures a screenshot from the data contained in a Succss capture state object.
 *
 * @param {Object} capture state
 */
succss.takeScreenshot = function(captureState) {

  casper.then(function() {
    casper.waitForSelector(captureState.selector, function() {

      // Processing before capture callbacks:
      if (captureState.before) {
        // Siblings are before functions made available in other before functions,
        // see http://succss.ifzenelse.net/configuration#before.
        var siblings = {};
        var pageCaptures = s.pages[captureState.page.name].captures;
        for (var c in pageCaptures) {
          if (c != captureState.name && pageCaptures[c].before) {
            siblings[c] = pageCaptures[c].before.bind(casper, siblings);
          }
        }
        captureState.before.call(casper, siblings);
      }
    }, function() {
      succss.echo('Selector "' + captureState.selector + '" was not found anywhere on the page.', 'ERROR');
    });
  });

  // Processing the 'hidden' capture property:
  if (captureState.hidden) {
    var selectors = captureState.hidden;
    casper.thenEvaluate(function(selectors) {
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
      succss.echo(err, 'ERROR');
      succss.catchErrors(err);
    }
  });
}

succss.init().run();
//    // Setting Succss.cliOptions.engine for reference:
//    try {
//      slimer;
//      s.cliOptions.engine = 'slimerjs';
//    }
//    catch(e) {
//      s.cliOptions.engine = 'phantomjs';
//    }