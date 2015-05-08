/**
 * @file
 * This file is used by "npm test" to selftest the succss package.
 * Selftests are made from http://succss.ifzenelse.net documentation website.
 * 
 * @see selftests/run.sh, selftests/test.sh
 * 
 */

var baseUrl = 'succss.ifzenelse.net';

/*
 * Succss.pages object is where you describe where and how screenshots are done.
 * The snippet below provides extensive examples, yours can be simpler though.
 * 
 * @see http://succss.ifzenelse.net/configuration#pages for more infos.
 */
Succss.pages = {
  'defaults': {
    url:baseUrl,
    // directory:'screenshots',
    // selector will be only 'body' if none specified
    // 'captures': {
    //   'body':'body'
    //  }
  },
  // Same as default, only directory differ.
  'home': {
    url:baseUrl,
    // Key:name Value:CSS selector.
    captures: {
      'body':'',
    },
  }
}

/*
 * Optional:
 * You can use a callback function after each capture is done.
 *
 * @param capture Object: same as in Succss.setFileName plus the following:
 * capture.file, capture.filePath, capture.action ('add' or 'check').
 *
 * @see selftests/data.class.js file
 * @see http://succss.ifzenelse.net/customize#callback
 *
 */
Succss.afterCapture = function (capture) {

  if (capture.action == 'add') {

    switch (capture.page.name) {

      case 'defaults':
        casper.test.assertEquals(capture.selector, 'body', 'Default selector is body');
        casper.test.assertEquals(capture.page.directory, './succss-reports/screenshots', 'Default directory is ./screenshots');
        break;

      case 'home':
        var defaultPath = './succss-reports/screenshots/defaults--body--default-viewport.png';
        if (fs.exists(defaultPath)) {
          casper.test.assertEquals(fs.size(capture.filePath), fs.size(defaultPath), 'Basic and default captures have the same size');
        }
        break;
    }
  }
}