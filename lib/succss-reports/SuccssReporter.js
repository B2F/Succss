/**
 * @file
 * Utility class to create a log file containing succss run informations.
 *
 * @returns {SuccssReporter}
 */
function SuccssReporter(records) {

  var self = this;
  var reports = Array();
  var dataLog = './succss-reports/runs.json.inc';
  var varTricks = 'var succssReports = ';

  var getStatus = function() {
    if (!records || !records.errors) return 'incomplete';
    return !records.errors.length ? 'success' : 'failure';
  }

  var construct = function() {
    // Cleaning captures redundancy (useful properties for hooks but dupes in reports):
    for (var c in records.captures) {
      delete records.captures[c].options;
    }
    // Updates the log file with a JSON object containing captures, Succss records infos and options.
    if (Succss.fs.exists(dataLog)) {
      reports = JSON.parse(Succss.fs.read(dataLog).replace(/^var.*= /g, ''));
    }
    var report = {
      id: records.startTime,
      status: getStatus(),
      records: records,
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
    if (!fs.exists('succss-reports/index.html')) {
      Succss.fs.copy(Succss.allOptions.npmpath + '/succss-reports/index.html', 'succss-reports/index.html');
    }
    var pageTypes = {
      'check':'check',
      'add':'references'
    }
    Succss.echo('Report: file://' + Succss.fs.absolute('.') + '/succss-reports/index.html#/' + pageTypes[Succss.allOptions.action], 'INFO_BAR');
  }

  construct();

  return self;
}