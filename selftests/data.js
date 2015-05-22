/**
 * @file
 * This file is used by "npm test" to selftest the succss package.
 * Selftests are made from http://succss.ifzenelse.net documentation website.
 * 
 * @see selftests/run.sh, selftests/test.sh
 * 
 */

SuccssShared = {};

// Protocol prefix is optional.
SuccssShared.url = 'succss.ifzenelse.net';

SuccssShared.baseDirectory = './succss-reports/screenshots';

SuccssShared.previousCaptureFile = '';

/*
 * exports.pages object is where you describe where and how screenshots are done.
 * The snippet below provides extensive examples, yours can be simpler though.
 *
 * @see http://succss.ifzenelse.net/configuration#pages for more infos.
 */
exports.pages = {
  // url parameter + directory suffix.
  'installation': {
    'url': SuccssShared.url+'?page=installation&variation=0',
    'directory':SuccssShared.baseDirectory+'/installation',
    captures: {
      'body':'body'
    },
  },
  'advanced-selectors': {
    'url':SuccssShared.url + '?&variation=10&bgColor=080',
    'directory':SuccssShared.baseDirectory+'/advanced-selectors',
    captures: {
      'green-catch-phrase':'header > div > #dynamic-line',
      // 1a. User input: Click on orange square changes the background color,
      // Selectors can have a hook callback "before" capture.
      'orange-catch-phrase': {
        'selector' : 'header > div > #dynamic-line',
        'before': function() {
          this.click('div.color-square#orange');
        }
      },
      // 1b. User input: wait for dom update before taking screenshot capture,
      'sidebarFixed': {
        'selector':'aside#colors',
        'before': function() {
            this.click('#logo-image');
            console.log('... Waiting for color squares reinitialization');
            this.wait(900);
        }
      },
      // 2. Calling siblings captures callbacks:
      'sidebar-orange': {
        'selector': 'aside#colors',
        // Calling captures callback have some advantages:
        // - Others selectors "before" actions can be avoided if necessary.
        // - Execution order is guaranteed as opposed to JS object iteration.
        before: function(captures) {
          captures.sidebarFixed();
          captures['orange-catch-phrase']();
        }
      },
      'header':'',
      // 3. Altering the dom:
      'header-mod': {
        'selector': 'header',
        // Removes part of the header to showcase how to alter the page with js.
        before: function(captures) {
          captures['orange-catch-phrase']();
          this.evaluate(function() {
            var header = document.getElementsByTagName('header');
            var clickImage = document.getElementById('click-here');
            header[0].removeChild(clickImage);
          });
        }
      },
    },
  },
  // 4. Showing minimum diff image width with a small capture (@see data-diff.js):
  'diffCanvas': {
    'url':SuccssShared.url + '?&variation=10&bgColor=080',
    'directory':SuccssShared.baseDirectory+'/diff-canvas',
    'captures': {
      'logoImg':{
        'selector': '#logo-image',
        before: function() {
          this.click('div.color-square#orange');
        }
      }
    }
  },
  'hiddenElements': {
    'url':SuccssShared.url+'/usecases',
    'directory':SuccssShared.baseDirectory+'/hiddenElement',
    'captures': {
      'navigation-menu': {
        selector: '#more-infos',
        hidden: '#colors div, #colors a'
      }
    }
  },
  // Should not be run unless explicitly. Used to verify that exports.options.[check|add] was used by default.
  'doesNotRun' : { url: 'willFail' }
};

/*
 * exports.setFileName sets your captures names for both adding and checking.
 * 
 * @param capture Object (available properties listed below):
 *  capture: name, selector, directory, callback
 *  capture.page: name, url, directory
 *  capture.viewport: name, width, height
 *  capture.options (command line options): pages, captures, viewports
 *  
 *  @see http://succss.ifzenelse.net/configuration#filename
 */
exports.setFileName = function(capture) {
  return capture.page.name + '-' + capture.name + '-' + capture.viewport.width + 'x' + capture.viewport.height + '.png';
};

/**
 * exports.viewports
 *
 * A list of viewports for taking screenshots.
 *
 * @see http://succss.ifzenelse.net/configuration#viewports
 *
 */
exports.viewports = {
 'wide':
  {
    'width':1920,
    'height':1200
  },
  'mobile-landscape':
  {
    'width':640,
    'height':480
  }
}

/*
 * Optional:
 * You can use a callback function after each capture is done.
 *
 * @param capture Object: same as in exports.setFileName plus the following:
 * capture.file, capture.filePath, capture.action ('add' or 'check').
 *
 * @see selftests/data.class.js file
 * @see http://succss.ifzenelse.net/customize#callback
 *
 */
exports.afterCapture = function (capture) {

  if (capture.action == 'add') {

    // The callback has access to an object representing the capture after it's done.
    var viewport = capture.viewport;

    var expectedCapturePath = capture.page.directory + '/' + this.setFileName(capture);

    if (expectedCapturePath != capture.filePath) {
      this.catchErrors('Unexpected capture path (' + capture.filePath + '). Expected path is '+ expectedCapturePath);
    }

    casper.test.assertTruthy(capture.name, '- Captured "' + capture.file + '" file for ' + capture.selector + " selector");
    casper.test.assertTruthy(this.fs.exists(expectedCapturePath), '- Capture file exists (' + expectedCapturePath + ')');
    casper.test.assertTruthy(viewport, '- With viewport "' + viewport.name + '" having ' + viewport.width + " width and " + viewport.height + " height.");

    casper.test.assertNotEquals(capture.filePath, SuccssShared.previousCaptureFile, 'The capture file path is different from previous capture.');
    SuccssShared.previousCaptureFile = capture.filePath;

    // slimerjs does not seem to support fs.size, at least on some browsers versions.
    if (this.options.engine != 'slimerjs') {

      if(fs.size(capture.filePath) < 500) {
        this.echo('The size of the generated image is less than 500 octets.', 'WARNING');
      }
    }
  }
};

/**
 * exports.options can take "default" options you would normally pass to the 
 * command line. Command line options take precedence.
 * 
 * @see http://succss.ifzenelse.net/commandline#options
 */
exports.options = {
  exitOnError:false,
  add: {
    'pages':'diffCanvas'
  },
  check: {
    'pages':'diffCanvas'
  }
}
