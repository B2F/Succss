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

  if (['add', 'check', 'help'].indexOf(Succss.cliOptions.do) == -1) {
    throw new Error('succss {{add | check} FILE.js} | help }');
  }

  if (Succss.fs.exists(Succss.cliOptions.dataFile)) {
    phantom.injectJs(Succss.cliOptions.dataFile);
  }
  else {
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
  console.log(Succss.colorizer.colorize(e, 'COMMENT'));
  console.log('See succss.ifzenelse.net for more infos.');
  console.log('Wrong succss arguments. Type succss help for help.');
  casper.exit();
}