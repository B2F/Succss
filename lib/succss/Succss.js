/**
 * @file
 * @abstract
 * @returns {Succss}
 */

exports.create = function(options) {

  s = require(options.npmpath + '/lib/overrider.js').create(['options']);

  /**
   * @private
   */
  var capturesFilters = false;

  /**
   * @interfaces driver
   */
  s.parseData = function(action) {};
  s.add = function(capture) {};
  s.check = function(capture) {};
  s.takeScreenshot = function(capture) {};

  /**
   * @interfaces config file
   */
  s.pages = {};
  s.options = {}; // optionnal
  s.viewports = {}; // optionnal
  s.setFileName = function(capture) {}; // optionnal
  s.callback = function(capture) {}; // optionnal
  s.diff = function(imgBase, imgCheck, capture) {}; // optionnal

  /**
   * @defaults
   */
  s.defaults = {
    viewports : { 
      'default': {
        'width':1366,
        'height':768
      }
    },
    records : {
      planned: {
        pages:[],
        viewports:[],
        selectors:[],
        captures:0,
      },
      captures: {},
      errors: [],
      startTime:0,
      startDate:null,
      execTime:0,
      exitcode:0    
    },
    echo : function(msg, type) {
      type === 'dump' ? /*Succss.utils.dump(msg);*/ true : console.log(msg); //console.log(Succss.colorizer.colorize(msg, type));*/}
      // Calls utils.dump when window.callPhantm({dump:object}) is used:
//  Alt:
//      if (data.dump) {
//        utils.dump(data.dump);
//      }
//      else {
//        console.log(data);
//      }
    },
    catchErrors : function(err) {
      s.records.exitcode = 1;
      s.records.errors.push(JSON.stringify(err));
      s.echo(err, 'ERROR');
    },
    exit : function(code) {
      console.log('exiting succss: ' + code);
    }
  }

  s.replaceWith(s.defaults);

  /**
   * @public
   */

  s.init = function() {
    s.options = options;
    s.fs = require('fs');
//    s.colorizer = require('colorizer').create('Colorizer');
//    s.utils = require('utils');
    s.replaceWith(require(s.options.npmpath + '/lib/succss/SuccssDiffTools.js'));
    // Implements interfaces (pages, options, viewports) and hooks (diff, afterCapture )
    s.replaceWith(require(s.options.configFilePath));
    s.processFilters();
    s.initCaptures();
    return s;
  }

  s.run = function() {
    s.records.startDate = new Date();
    s.records.startTime = s.records.startDate.getTime();
    s.parseData(s[s.options.action]);
  }

  /**
   * Prepends a filepath, removes double slashes and "current directory" dots.
   *
   * @param {String} path used as a prefix
   * @param {String} dir used as a suffix
   * @returns {String} the resulting filepath
   */
  s.cleanPreprendPath = function(prefix, suffix) {
    return prefix.replace(/\/$/, '') + '/' + suffix.replace(/^(\.\/|\/)/, '');
  }

  s.processFilters = function() {

    s.records.planned.pages = Object.keys(s.pages);
    s.records.planned.viewports = Object.keys(s.viewports);

    try {
      // Processes the --pages option: restricts the pages keys object to it.
      if (s.options.pages != undefined && s.options.pages !== true) {
        s.records.planned.pages = s.options.pages.split(',');
        // Support for '=,s...' (Replacement fix for '=s...' with SlimerJs engine):
        while (s.records.planned.pages.indexOf('') != -1) {
          s.records.planned.pages.splice(s.records.planned.pages.indexOf(''), 1);
        }
        s.echo('\n--pages option found, captures will only run for <' + s.options.pages + '> pages.', 'WARNING');
        for (var p in s.records.planned.pages) {
          if(s.pages[s.records.planned.pages[p]] == undefined) {
            throw '[SUCCSS] The page configuration "' + s.records.planned.pages[p] + '" was not found. Available pages: ' + Object.keys(s.pages).join(', ');
          }
        }
      }
      // Processes the --captures option:
      if (s.options.captures != undefined && s.options.captures !== true) {
        capturesFilters = options.captures.split(',');
        s.echo('\n--captures option found, captures will only run for <' + s.options.captures + '>', 'WARNING');
      }
      // Processes the --viewports option: restricts the viewports keys object to it.
      if (s.options.viewports != undefined) {
        s.records.planned.viewports = s.options.viewports.split(',');
        // Support for '=,s...' (Replacement fix for '=s...' with SlimerJs engine):
        while (s.records.planned.viewports.indexOf('') != -1) {
          s.records.planned.viewports.splice(s.viewports.indexOf(''), 1);
        }
        s.echo('\n--viewports option found, captures will only run with <' + s.options.viewports + '> viewport.', 'WARNING');
        for (var v in s.records.planned.viewports) {
          if(s.viewports[s.records.planned.viewports[v]] == undefined) {
            throw '[SUCCSS] The viewport "' + s.records.planned.viewports[v] + '" was not found. Available viewports: ' + Object.keys(s.viewports).join(', ');
          }
        }
      }
      Object.keys(s.viewports).forEach(function(viewportName) {
        s.viewports[viewportName].name = viewportName;
        if (typeof s.viewports[viewportName].height != 'number' ||
            typeof s.viewports[viewportName].width != 'number') {
          throw "[SUCCSS] The viewport height and width must be set with numbers.";
        }
      });
      s.echo('Available viewports: ' + Object.keys(s.viewports).join(', '), 'VERBOSE');
    }
    catch(e) {
      s.catchErrors(e);
    }
  }

  s.initCaptures = function() {

    try {

      var availableCaptures = [];

      /**
       * Fills the data object with values processed from the javascript configuration file.
       * The data object's has pages and captures properties later used in self.parseData.
       */
      s.records.planned.pages.forEach(function(page) {

        s.pages[page].name = page;

        if (s.pages[page].source != undefined) {
          var source = s.pages[page].source;
          if (s.pages[source] == undefined) {
            throw '[SUCCSS] Source property must have a matching page ("' +  page + '" is missing "' + source + '" source).';
          }
          function extendPage(origin, copy) {
            for (var prop in origin) {
              if (copy[prop] == undefined && typeof origin[prop] != 'object') {
                copy[prop] = origin[prop];
              }
              else if (typeof(origin[prop]) == 'object') {
                copy[prop] = {};
                copy[prop] = extendPage(origin[prop], copy[prop]);
              }
            }
            return copy;
          }
          s.pages[page] = extendPage(s.pages[source], s.pages[page]);
        }

        if (s.pages[page].url == undefined) {
          throw '[SUCCSS] Your configuration page "' + page + '" requires an url."';
        }
        if (s.pages[page].url.indexOf('://') == -1) {
          s.pages[page].url = 'http://' + s.pages[page].url;
        }

        if (!s.pages[page].directory) s.pages[page].directory = './succss-reports/screenshots';

        if (s.options.action == 'add' && s.options.rmtree == true && s.fs.isDirectory(s.pages[page].directory)) {
          s.echo('\nWarning! ' + s.pages[page].directory + " directory tree erased.", 'WARNING');
          s.fs.removeTree(s.pages[page].directory);
        }

        if (s.pages[page].captures == undefined || !Object.keys(s.pages[page].captures).length) {
          s.pages[page].captures = {
            'body':''
          }
        }

        var captures = s.pages[page].captures;
        s.pages[page].captureKeys = [];

        for (var c in captures) {

          availableCaptures.push(c);

          if (!capturesFilters || capturesFilters.indexOf(c) !== -1) {

            s.pages[page].captureKeys.push(c);
            s.records.planned.selectors.push(c);

            if (typeof(s.pages[page].captures[c]) == 'object') {
              s.pages[page].captures[c] = captures[c];
              s.pages[page].captures[c].selector = captures[c].selector || c;
              s.pages[page].captures[c].before = captures[c].before || false;
            }
            else {
              s.pages[page].captures[c] = {
                selector:captures[c] || c
              }
            }
            s.pages[page].captures[c].name = c;
            s.pages[page].captures[c].after = s.afterCapture || false;
          }
        }
      });

      if (!s.records.planned.selectors.length) {
        throw "[SUCCSS] No captures selector found. " +  'Available captures: ' + availableCaptures.join(', ');;
      }

      s.records.planned.captures = s.records.planned.selectors.length * s.records.planned.viewports.length;
    }
    catch(e) {
      s.catchErrors(e);
    }
  }

  s.createCaptureState = function(pageName, viewportName, captureIndex) {
    if (typeof s.pages[pageName] !== 'object') s.catchErrors('[SUCCSS] Page ' + pageName + ' is missing from your configuration file. You can\'t compareToPage without it. Available pages: ' + Object.keys(s.pages).join(', '));
    if (typeof s.viewports[viewportName] !== 'object') s.catchErrors('[SUCCSS] Viewport ' + viewportName + ' is missing from your configuration file. You can\'t compareToViewport without it. Available viewports: ' + Object.keys(s.viewports).join(', '));
    if (typeof s.pages[pageName].captures[captureIndex] != 'object') throw('[SUCCSS] Capture "' + captureIndex + '" is missing from your configuration page named "' + pageName +'"/ Your captures must be present on both sides when compareToPage is used.');
    // Available in setFileName:
    var captureStateDefaults = {
      page: {},
      viewport: {},
      records: {},
      options: s.options,
      differences: []
    };
    captureState = require(s.options.npmpath + '/lib/overrider.js').create(['captures']);
    captureState.replaceWith(captureStateDefaults);
    captureState.replaceWith(s.pages[pageName].captures[captureIndex]);
    captureState.replaceWith({page: s.pages[pageName]});
    captureState.replaceWith({viewport: s.viewports[viewportName]});
    captureState.replaceWith({records: s.records});
    captureState.id = captureState.page.name + '--' + captureState.viewport.name + '--' + captureState.name,
    // Available in the after capture callback:
    captureState.file = s.setFileName(captureState);
    captureState.filePath = captureState.page.directory.replace(/\/$/, '') + '/' + captureState.file;
    captureState.action = captureState.options.action;
    return captureState;
  }

  s.setFileName = function(captureState) {
    return captureState.page.name + '--' + captureState.name + '--' + captureState.viewport.width + 'x' + captureState.viewport.height + '.png';
  };

  /**
   * Sets the filepath used as image reference.
   *
   * @param {Object} capture state
   */
  s.setCaptureReferenceFilePath = function(capture) {

    var pageReference = s.options.compareToPage || capture.page.name;
    var viewportReference = s.options.compareToViewport || capture.viewport.name;
    // If compareTo{Page|Viewport} option is set, gets the filepath corresponding
    // to the capture index (page, capture, viewport):
    if (s.options.compareToViewport || s.options.compareToPage) {
      capture.basePath = s.createCaptureState(pageReference, viewportReference, capture.name).filePath;
      // Information used to keep references in reports:
      capture.comparedTo = {
        page: {
          'name': data[pageReference].name,
          'url': data[pageReference].url
        },
        viewport: {
          'name': s.viewports[viewportReference].name,
          'size': s.viewports[viewportReference].width + 'x' + s.viewports[viewportReference].height
        }
      }
    }
    else {
      capture.comparedTo = false;
      capture.basePath = capture.filePath;
    }
  }

  s.completeCapture = function(succeed, capture, message) {
    // After capture callback:
    if (capture.after != undefined) {
      try {
        capture.after.call(s, capture);
      }
      catch (err) {
        s.catchErrors(err);
      }
    }

    // Capture keys can be overrided when the capture.complete event is emitted.
    s.records.captures[capture.id] = capture;
  }

  s.completeRun = function() {
    var now = new Date();
    s.records.execTime = now.getTime() - s.records.startTime;
    var capturedNb = Object.keys(s.records.captures).length;
    var expectedCapturedNb = s.records.planned.captures;
    if (s.records.errors.length) {
      s.echo('Tests failed with ' + s.records.errors.length + ' errors.', 'ERROR');
    }
    else if (capturedNb == expectedCapturedNb) {
      s.echo('[SUCCSS] ' + capturedNb + '/' + expectedCapturedNb + ' captures tests pass! ', 'GREEN_BAR');
    }
    else {
      s.catchErrors('All captures were not correctly taken (' + expectedCapturedNb + ' planned, ' + capturedNb + ' done).');
    }
    if (s.options.report) {
      var succssReporterLibPath = s.options.npmpath + '/lib/succss/SuccssReporter.js';
      s.replaceWith(require(succssReporterLibPath));
      s.report(s.records);
    }
    // cleanup:
    if (s.options.action == 'check' && !s.options.checkDir && !s.options.keepTmp) {
      fs.removeTree(s.options.checkDir);
    }
    s.exit(s.records.exitcode);    
  }

  return s;
}