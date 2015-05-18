#!/usr/bin/env node

// @todo set env variable to resolve a driver
// @todo parsed arguments with the binary

var child_process = require("child_process"),
    path          = require("path"),
    fs            = require('fs'); 
var scriptPath = __dirname,
    npmPath = path.resolve(scriptPath, '..'),
    configFilePath = false,
    cliArgsArgv = process.argv.slice(2),
    allArgsArgv = [].concat(cliArgs),
    cliArgs = {},
    allArgs = {},
    verbose = false,
    slimerjsCheck = false,
    report = true,
    availableActions = ['add', 'check'],
    action,
    child;

var SuccssCLI = require(npmPath + '/lib/succss/SuccssCliArgs');
cliArgs = SuccssCLI.argvToObject(cliArgsArgv);

if (!cliArgs.action || !cliArgs.configFilePath || availableActions.indexOf(cliArgs.action) === -1) {
      console.log('Success! Detect differences between websites updates.');
      console.log('Usage: succss {{add | check} FILE.js} | help } [OPTION]...\n');
      console.log('  add                       adds screenshots references.');
      console.log('  check                     checks current website status against references.');
      console.log('  --pages=p1,p2,p3...       filters captures by pages. Alt syntax: -p p1,p2,p3...');
      console.log('  --viewports=v1,v2,v3...   filters captures by viewports. Alt syntax: -v v1,v2,v3');
      console.log('  --captures=c1,c2,c3...    filters captures by selectors. Alt syntax: -c c1,c2,c3');
      console.log('  --compareToPage=p         compare all to a single page (check only). Alt syntax: -ctp p');
      console.log('  --compareToViewport=v     compare all to a single viewport (check only). Alt syntax: -ctv v');
      console.log('  --rmtree                  erases the base directory recusively before captures (add only).');
      console.log('\nOnline documentation: http://succss.ifzenelse.net');
}
else {

  if (cliArgs.configFilePath.charAt(0) !== '/') {
    cliArgs.configFilePath = process.cwd() + '/' + cliArgs.configFilePath;
  }

  if (!fs.existsSync(cliArgs.configFilePath)) {
    console.log('Configuration file is missing ' + cliArgs.configFilePath);
    process.exit(1);
  }
  try {
    var customConfig = require(cliArgs.configFilePath) || false;
  }
  catch (e) {
    console.log('Your configuration file is invalid:\n' + e);
    process.exit(1);
  }
  if (typeof customConfig.options === 'object') {
    fileArgs = customConfig.options;
  }
  if (typeof customConfig.pages !== 'object') {
    console.log('Your configuration file needs to declare at least exports.pages.');
    process.exit(1);
  }
  allArgs = SuccssCLI.merge(cliArgs, fileArgs);

  if (allArgs.report && allArgs.report === 'false') report = false;

  allArgs.npmpath = npmPath;

  switch (allArgs.driver) {

    case 'casperjs':

      // When slimerjs is run with the check command, add with slimer then check with phantom
      if (allArgs.engine && allArgs.engine.match(/("|')?slimerjs("|')?/gi) &&
          cliArgs.action === 'check' && !allArgs.checkDir) {

        allArgs.action = 'add';

        if (slimerjsCheck) {
          allArgs.slimerCheck = true;
          // Always disable reporting in slimer's phantom check:
          allArgs.report = false;
          console.log('... SlimerJS is taking captures updates');
          allArgsArgv = SuccssCLI.objectToArgv(allArgs);
          phantomOutput = child_process.execSync('casperjs ' + allArgsArgv, {encoding: 'utf8'});
          if (allArgs.verbose) console.log(phantomOutput);
          console.log('Done');
          // Restores reporting if enabled:
          allArgs.report = report;
          // Check with phantomjs engine:
          allArgs.action = 'check';
          allArgs.engine = 'phantomjs';
          allArgsArgv = SuccssCLI.objectToArgv(allArgs);
        }
      }
      allArgsArgv = SuccssCLI.objectToArgv(allArgs);
      allArgsArgv.unshift('test', npmPath + '/drivers/succss-casper.js');
      break;
  }

// verbose
//  s.getAllOptions = function() {
//    var allOptions = '';
//    for (var i in Succss.allOptions) {
//      allOptions += '--' + i + '=' + Succss.allOptions[i] + ', ';
//    }
//    allOptions = allOptions.slice(0, -2);
//    return allOptions;
//  }

  casper = child_process.spawn(allArgs.driver, allArgsArgv);
}

var firstDataLine = true;

casper.stdout.on('data', function(buf) {

  var processStopString = /exiting succss: (\d)\n/g,
      exit = processStopString.exec(buf.toString());

  if (exit) {
    // Displays data strings received with exit string, if any:
    console.log(buf.toString().replace(exit[0], ''));
    // Retrieve and prints the exit code:
    process.exit(exit[1]);
  }
  else {
    // Removes Casperjs "Test file" line:
    if (firstDataLine) {
      firstDataLine = false;
    }
    else {
      console.log(buf.toString().split(/(\r?\n)/g).slice(0, -2).join(''));
    }
  }
})

casper.stderr.on('data', function(data) {
  console.log('Error: ' + data);
})

casper.on('exit', function (code) {
    console.log('Casperjs exited prematurely before succss finished.');
    process.exit(1);
});