
var Succss = require(casper.cli.options.npmpath + '/lib/succss/Succss').create(casper.cli.options);

//    // Setting Succss.cliOptions.engine for reference:
//    try {
//      slimer;
//      s.cliOptions.engine = 'slimerjs';
//    }
//    catch(e) {
//      s.cliOptions.engine = 'phantomjs';
//    }

casper.exit();