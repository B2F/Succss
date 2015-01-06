
phantom.injectJs(fs.workingDirectory + '/selftests/data.class.js');

Succss.webpages = {
  // url parameter + directory suffix.
  'installation': {
    'url': SuccssDataCommon.url+'?page=installation&variation=0',
    'directory':SuccssDataCommon.baseDirectory+'/installation',
    captures: {
      'body':'body'
    },
  },
  'advanced-selectors': {
    'url':SuccssDataCommon.url + '?&variation=10&bgColor=080',
    'directory':SuccssDataCommon.baseDirectory+'/advanced-selectors',
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
    }
  }
};

/*
 * Available capture Object properties ->
 * capture: name, selector, directory, callback
 * capture.page: name, url, directory
 * capture.viewport: name, width, height
 * capture.options (current filters): pages, captures, viewports
 */
Succss.setFileName = function(capture) {
  return capture.page.name + '--' + capture.name + '--' + capture.viewport.width + 'x' + capture.viewport.height + '.png';
};

Succss.viewports = {
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
 * capture Object: @see Succss.setFileName above plus the following:
 * capture.file, capture.filePath, capture.action (add or check).
 *
 * @see selftests/data.class.js pratical example.
 *
 */
Succss.callback = function (capture, countSuccss) {

  if (capture.action == 'add') {
    SuccssDataCommon.test.call(this, capture, countSuccss);
    SuccssDataCommon.assertSuiteSuccess(countSuccss);
  }
};