#!/usr/bin/env node

var child_process = require("child_process"),
    path          = require("path");
var scriptPath = __dirname,
    casperbridge = path.resolve(scriptPath, '../succss-bridge.js'),
    requireArgs = ['test', casperbridge],
    allArgs = [].concat(requireArgs),
    verbose = false,
    logLevel = false,
    slimerjsCheck = false,
    report = true,
    action,
    child;

allArgs.push('--npmpath='+path.resolve(scriptPath, '..'));
allArgs.push('--scriptpath='+scriptPath);
allArgs.push('--libpath='+path.resolve(scriptPath, '../lib'));

if (process.argv.length < 3) {
  casper = child_process.spawn('casperjs', allArgs);
}
// take first argument for the --action option value in allArgs
else {
    action = process.argv.splice(2, 1);

  // take the second argument for the --dataFile option value in allArgs
  if (process.argv.length >= 3) {
    allArgs.push("--dataFile="+process.cwd() + '/' + process.argv.splice(2, 1));
  }

  process.argv.slice(2).forEach(function(arg) {
    // prepare arguments for casperjs:
    if (arg.indexOf('--') === 0) {
      if (arg.indexOf('--report=false') !== -1) {
        report = false;
      }
      // There is a bug with the logLevel option, we skip it:
      if (arg.indexOf('--logLevel') === -1) {
        allArgs.push(arg);
      }
    }
  });

  // when slimerjs is run with the check command, add with slimer then check with phantom
  var argsString = allArgs.join(' ');
  if (action == 'check' && argsString.match(/--engine=("|')?slimerjs("|')?/gi) && argsString.indexOf('--checkDir') === -1) {
    action = 'add';
    slimerjsCheck = true;
  }
  if (argsString.match(/--report=false/gi)) {
    report = false;
  }
  allArgs.push('--action=' + action);

  if (slimerjsCheck) {
    allArgs.push('--slimerCheck');
    argsString = allArgs.join(' ');

    // Always disable reporting in slimer's phantom check:
    allArgs.push('--report=false');
    console.log('... SlimerJS is taking captures updates');
    phantomOutput = child_process.execSync('casperjs ' + allArgs.join(' '), {encoding: 'utf8'});
    if (argsString.indexOf('--verbose') !== -1) console.log(phantomOutput);
    console.log('Done');
    // Restores reporting if enabled:
    if (report) argsString = argsString.replace('--report=false', '--report=true');
    // Check with phantomjs engine:
    argsString = argsString.replace(/slimerjs/gi, 'phantomjs');
    argsString = argsString.replace('add', 'check');
    allArgs = argsString.split(' ');
  }

  casper = child_process.spawn('casperjs', allArgs);
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