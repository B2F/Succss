/**
 * @file casper-bridge.js
 *
 * Bridge bewteen succss commandline, casperjs and succss.js
 *
 */
try {

  var fs = require('fs');

  var Succss = {};
  var colorizer = require('colorizer').create('Colorizer');
  var utils = require('utils');
  var cliOptions = casper.cli.options;

  if (['add', 'check', 'help'].indexOf(cliOptions.do) == -1) {
    throw new Error('succss {{add | check} FILE.js} | help }');
  }

  if (fs.exists(cliOptions.dataFile)) {
    phantom.injectJs(cliOptions.dataFile);
  }
  else {
    throw '[Succss] File "' + cliOptions.dataFile + '" not found. Please enter a valid relative path.';
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
  for (var opt in cliOptions) {
    Succss.allOptions[opt] = cliOptions[opt];
  }

  if (cliOptions.do == 'help') {
    console.log('Capture base screenshots of successful CSS designs.');
    console.log('succss add FILE.js [--sets=a[,b,c...]] [--sections=d[,e,f...]] [--rmtree]');
    console.log('--sets: filter captures by datasets.');
    console.log('--sections: filter captures by sections (require at least one dataset).');
    console.log('--rmtree: erase the base directory recusively before capture.');
    console.log('\nCheck and report if the current CSS is successful or failing.')
    console.log('succss check FILE.js [--sets=a[,b,c...]] [--sections=d[,e,f...]]');
    console.log('--sets: filter captures by datasets.');
    console.log('--sections: filter captures by sections (require at least one dataset).');
    casper.exit();
  }
  else {

    Succss.casper = new casper.constructor(Succss.allOptions);
    var mouse = require("mouse").create(Succss.casper);

    var succss = require('succss.js').Succss.call(Succss);

    if (cliOptions.do == 'add') {
      succss.add();
    }
    else if (cliOptions.do == 'check') {
      succss.check();
    }
  }
}
catch(e) {
  console.log(colorizer.colorize(e, 'COMMENT'));
  console.log('See succss.ifzenelse.net for more infos.');
  console.log('Wrong succss arguments. Type succss help for help.');
  casper.exit();
}