/**
 * @file casper-bridge.js
 *
 * Bridge bewteen succss commandline, casperjs and succss.js
 *
 */
try {

  var Succss = {};
  Succss.fs = require('fs');
  Succss.colorizer = require('colorizer').create('Colorizer');
  Succss.utils = require('utils');
  Succss.cliOptions = casper.cli.options;

  Succss.echo = function(msg, type) {
    console.log(Succss.colorizer.colorize(msg, type));
  }

  if (['add', 'check', 'help'].indexOf(Succss.cliOptions.do) == -1) {
    throw new Error('succss {{add | check} FILE.js} | help }');
  }

  if (Succss.fs.exists(Succss.cliOptions.dataFile)) {
    phantom.injectJs(Succss.cliOptions.dataFile);
  }
  else if (Succss.cliOptions.do != 'help') {
    throw '[Succss] File "' + Succss.cliOptions.dataFile + '" not found. Please enter a valid relative path.';
  }

  Succss.allOptions = {
    imgType:'png',
    imgQuality:'80',
    tmpDir:'.succss-tmp',
    diff:true,
    imagediff:true,
    resemble:false,
    diffQuality:'80',
    tolerancePixels:'0',
  };
  for (var opt in Succss.options) {
    Succss.allOptions[opt] = Succss.options[opt];
  }
  for (var opt in Succss.cliOptions) {
    Succss.allOptions[opt] = Succss.cliOptions[opt];
  }

  if (Succss.cliOptions.do == 'help') {
    Succss.echo('Capture base screenshots of successful CSS designs.', 'INFO');
    Succss.echo('succss {{add | check} FILE.js} | help } [--pages=p1,p2,p3...] [--captures=c1,c2,c3...] [--viewports=v1,v2,v3...] [--rmtree]', 'COMMENT');
    Succss.echo('--pages: filter captures by pages.', 'PARAMETER');
    Succss.echo('--captures: filter captures by selectors.', 'PARAMETER');
    Succss.echo('--viewports: filter captures by viewports.', 'PARAMETER');
    Succss.echo('--rmtree: erase the base directory recusively before capture.', 'PARAMETER');
    Succss.echo('@see http://succss.ifzenelse.net', 'INFO_BAR');
    casper.exit();
  }
  else {

    Succss.casper = new casper.constructor(Succss.allOptions);
    Succss.mouse = require("mouse").create(Succss.casper);

    var succss = require('succss.js').Succss.call(Succss);

    if (Succss.cliOptions.do == 'add') {
      succss.add();
    }
    else if (Succss.cliOptions.do == 'check') {
      try {
        slimer;
        console.log(Succss.colorizer.colorize('[Succss] succss does not currently support the check command with slimerjs engine."', 'ERROR'));
        casper.exit();
      }
      catch(e) {
        succss.check();
      }
    }
  }
}
catch(e) {
  Succss.echo(e, 'COMMENT');
  Succss.echo('See succss.ifzenelse.net for more infos.');
  Succss.echo('Wrong succss arguments. Type succss help for help.');
  casper.exit();
}