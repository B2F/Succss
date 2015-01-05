/**
 * @file
 *
 *
 */
var fs = require('fs');

var Succss = {};
var options = casper.cli.options;

if (fs.exists(options.dataFile)) {
  phantom.injectJs(options.dataFile);
}
else {
  throw "[Succss] File " + options.dataFile + " not found. Please enter a valid relative path.";
}

//phantom.injectJs('lib/imagediff.js');

try {
  if (options.do == 'help') {
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

    Succss.casper = new casper.constructor(options);
    var mouse = require("mouse").create(Succss.casper);
    var colorizer = require('colorizer').create('Colorizer');
    var utils = require('utils');

    var succss = require('succss.js').Succss.call(Succss, options);

    if (options.do == 'add') {
      succss.add();
    }
    else if (options.do == 'check') {
      succss.check();
    }
    else {
      throw new Error('Add, check or help');
    }
  }
}
catch(e) {
  console.log(e);
  console.log('See http://... for more infos.');
  throw 'Wrong succss arguments. Type succss help for help.';
  casper.exit();
}
