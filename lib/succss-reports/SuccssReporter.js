/**
 * @file
 * Utility class to create a log file containing succss run informations.
 *
 * @returns {SuccssReporter}
 */
function SuccssReporter(stats) {

  var self = this;
  var reports = Array();
  var dataLog = './succss-reports/runs.json.inc';
  var varTricks = 'var succssReports = ';

  var construct = function() {
    // Cleaning captures redundancy (useful properties for hooks but dupes in reports):
    for (var c in stats.failures) {
      delete stats.failures[c].stats;
      delete stats.failures[c].options;
    }
    for (var c in stats.success) {
      delete stats.success[c].stats;
      delete stats.success[c].options;
    }
    // Updates the log file with a JSON object containing captures, Succss stats infos and options.
    if (Succss.fs.exists(dataLog)) {
      reports = JSON.parse(Succss.fs.read(dataLog).replace(/^var.*= /g, ''));
    }
    var report = {
      id: stats.startTime,
      stats: stats,
      options: Succss.allOptions
    }
    reports.unshift(report);
  }

  /**
   * Writes reports to the dataLog file.
   */
  self.report = function() {
    Succss.fs.write(dataLog, varTricks + JSON.stringify(reports), 'w');
    // Copy the reporter webpage interface to current directory if necessary:
    Succss.fs.copy(Succss.allOptions.libpath + '/../succss-reports/index.html', 'succss-reports/index.html');
  }

  construct();

  return self;
}