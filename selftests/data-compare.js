/**
 * @file
 * 
 * Compare multiple viewports to one reference, same for pages.
 * 
 */

phantom.injectJs(fs.workingDirectory + '/selftests/data.js');

var installation = Succss.pages['installation'];
var diffCanvas = Succss.pages['diffCanvas'];

// We keep advanced selectors only.
Succss.pages = {};

Succss.pages['installation'] = installation;

Succss.pages['configuration'] = {
  url:SuccssDataCommon.url + '?page=configuration&variation=10&bgColor=A7A',
  source:'installation'
}
Succss.pages['customize'] = {
  url:SuccssDataCommon.url + '?page=customize&variation=10&bgColor=123',
  source:'installation'
}
Succss.pages['fork'] = {
  url:SuccssDataCommon.url + '?page=fork&variation=10&bgColor=789',
  source:'installation'
}

Succss.callback = function(capture) {
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
  'mobile-portrait': {
    width:480,
    height:640
  }
}

Succss.setFileName = function(capture) {
  // Compare all to the 'wide' viewport (see data.js viewports):
  var viewport = '1920x1200';
  // Compare all to the advanced-selector installation page:
  var page = 'installation';
  // Selector (capture.name) remains dynamically configured:
  return page + '-' + capture.name + '-' + viewport + '.png';
}