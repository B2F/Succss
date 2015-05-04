/**
 * @file casper-bridge.js
 *
 * Bridge bewteen succss commandline, casperjs and succss.js
 *
 */
try {

  // Initialisation:
  var Succss = {};
  Succss.fs = require('fs');
  Succss.colorizer = require('colorizer').create('Colorizer');
  Succss.utils = require('utils');
  Succss.cliOptions = casper.cli.options;
  Succss.echo = function(msg, type) {
    if (type == 'dump') {
      Succss.utils.dump(msg);
    }
    else {
      console.log(Succss.colorizer.colorize(msg, type));
    }
  }

  // Setting Succss.cliOptions.engine for reference:
  try {
    slimer;
    Succss.cliOptions.engine = 'slimerjs';
  }
  catch(e) {
    Succss.cliOptions.engine = 'phantomjs';
  }

  // The binary should handle SlimerJS checking with PhantomJS, never hitting this condition:
  if (Succss.cliOptions.action == 'check' && Succss.cliOptions.engine == 'slimerjs') {
    console.log(Succss.colorizer.colorize('[Succss] succss actiones not currently support the check command with slimerjs engine."', 'ERROR'));
    casper.exit();
  }

  switch (Succss.cliOptions.action) {

    case undefined:
    case 'help':

      Succss.echo('Capture base screenshots of successful CSS designs.', 'INFO');
      Succss.echo('succss {{add | check} FILE.js} | help } [--pages=p1,p2,p3...] [--captures=c1,c2,c3...] [--viewports=v1,v2,v3...] [--compareToPage=cN] [--compareToViewport=vN] [--rmtree]', 'COMMENT');
      Succss.echo('--pages: filter captures by pages.', 'PARAMETER');
      Succss.echo('--captures: filter captures by selectors.', 'PARAMETER');
      Succss.echo('--viewports: filter captures by viewports.', 'PARAMETER');
      Succss.echo('--rmtree: erase the base directory recusively before capture.', 'PARAMETER');
      Succss.echo('@see http://succss.ifzenelse.net', 'INFO_BAR');
      casper.exit();
      break;

    case 'list':
    case 'add':
    case 'check':

      Succss.allOptions = {
        imgType:'png',
        imgQuality:'80',
        diff:true,
        imagediff:true,
        resemble:false,
        diffQuality:'70',
        tolerancePixels:'0',
        diffLightness:100
      };

      // Injecting the succss.js script to create succss from a casper object.
      var dataFilePath = Succss.cliOptions.dataFile;
      if (fs.exists(dataFilePath)) {
        phantom.onError = function(msg, stack) {
          Succss.echo("There is an error in your " + dataFilePath + " Succss configuration file" + ".", 'ERROR');
          Succss.echo(msg, 'ERROR');
          if (stack.length && stack[0].line) {
            var filename = stack[0].file.replace(new RegExp('^.*/'), '');
            Succss.echo('Found at line ' + stack[0].line + ' in file ' + filename, 'ERROR');
          }
          casper.exit(1);
        }
        phantom.injectJs(dataFilePath);
      }
      else {
        throw '[Succss] File "' + dataFilePath + '" not found. Please enter a valid relative path.';
      }

      // 1, load options from configuration file:
      for (var opt in Succss.options) {
        Succss.allOptions[opt] = Succss.options[opt];
      }
      for (var opt in Succss.cliOptions) {
        Succss.allOptions[opt] = Succss.cliOptions[opt];
      }

      Succss.getAllOptions = function() {
        var allOptions = '';
        for (var i in Succss.allOptions) {
          allOptions += '--' + i + '=' + Succss.allOptions[i] + ', ';
        }
        allOptions = allOptions.slice(0, -2);
        return allOptions;
      }

      Succss.casper = new casper.constructor(Succss.allOptions);
      Succss.mouse = require("mouse").create(Succss.casper);

      var succss = require('succss.js').Succss.call(Succss);
      succss[Succss.cliOptions.action]();
      break;

    default:
      throw new Error('succss { { add | check | list } FILE.js } | help }');

  }
}
catch(e) {
  Succss.echo(e, 'COMMENT');
  Succss.echo('Wrong succss arguments. Type succss help for infos.');
  Succss.echo('See succss.ifzenelse.net for more infos.');
  casper.exit();
}