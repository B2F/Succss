/**
 * @file
 * This file is used by "npm test" to selftest the succss package.
 * Selftests are made from http://succss.ifzenelse.net documentation website.
 * 
 * Compare multiple viewports to one reference, same for pages.
 * 
 * @see selftests/run.sh, selftests/test.sh
 *
 */

phantom.injectJs('selftests/data-diff.js');

Succss.pages = {
  'advanced-selectors': {
    'url':SuccssShared.url + '?&variation=10&bgColor=080',
    'directory':SuccssShared.baseDirectory+'/advanced-selectors',
    captures: {
      'header':''
    }
  },
  'configuration' : {
    url:SuccssShared.url + '?page=configuration',
    source:'advanced-selectors'
  },
  'customize' : {
    url:SuccssShared.url + '?page=customize&bgColor=123',
    source:'advanced-selectors'
  },
  'fork' : {
    url:SuccssShared.url + '?page=fork&bgColor=789',
    source:'advanced-selectors'
  }
};

Succss.afterCallback = function(capture) {
  viewport = capture.viewport;
  casper.test.assertTruthy(capture.name, '- Captured "' + capture.file + '" file for ' + capture.selector + " selector");
  casper.test.assertTruthy(viewport, '- With viewport "' + viewport.name + '" having ' + viewport.width + " width and " + viewport.height + " height.");
}

Succss.viewports = {
  'default-reduced': {
    width:1270,
    height:720
  },
  '1600x1200': {
    width:1600,
    height:1200    
  },
  'mobile-landscape': {
    width:640,
    height:480
  }
}

/**
 * Succss.options can take "default" options you would normally pass to the
 * command line. Command line options take precedence.
 * 
 * @see http://succss.ifzenelse.net/commandline#options
 */
Succss.options = {
  // Disabling default imagediff behavior (inverting the casper test).
  'imagediff':true,
  'diffQuality':100,
  'captures':'header',
  'viewports':'default-reduced',
  'compareToPage':'advanced-selectors',
  'compareToViewport':'mobile-landscape'
}