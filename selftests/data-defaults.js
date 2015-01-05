
phantom.injectJs(fs.workingDirectory + '/selftests/data.class.js');

Succss.webpages = {
  'defaults': {
    url:SuccssDataCommon.url,
    // directory:'screenshots',
    // selector will be only 'body' if none specified
    // 'captures': {
    //   'body':'body'
    //  }
  },
  // Same as default, only directory differ.
  'home': {
    url:SuccssDataCommon.url,
    directory:SuccssDataCommon.baseDirectory,
    // Key:name Value:CSS selector.
    captures: {
      'homebody':'body',
    },
  }
}

/* 
 * Optional:
 * You can use a callback function after each capture is done.
 */
Succss.callback = function (capture, countSuccss) {

  if (capture.action == 'add') {

    SuccssDataCommon.test.call(this, capture, countSuccss);

    switch (capture.page.name) {

      case 'defaults':
        casper.test.assertEquals(capture.selector, 'body', 'Default selector is body');
        casper.test.assertEquals(capture.page.directory, './screenshots', 'Default directory is ./screenshots');
        break;

      case 'home':
        var defaultPath = './screenshots/body--default-viewport.png';
        if (fs.exists(defaultPath)) {
          casper.test.assertEquals(fs.size(capture.filePath), fs.size(defaultPath), 'Basic and default captures have the same size');
        }
        break;
    }
  }

  SuccssDataCommon.assertSuiteSuccess(countSuccss);
}