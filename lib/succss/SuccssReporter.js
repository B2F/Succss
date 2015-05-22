/**
 * @file
 * Utility class to create a log file containing succss run informations.
 *
 * @returns {SuccssReporter}
 */
exports.report = function(records) {

  var s = this;
  var reports = Array();
  var dataLog = './succss-reports/runs.json.inc';
  var varTricks = 'var succssReports = ';

  // Cleaning captures redundancy (useful properties for hooks but dupes in reports):
  for (var c in records.captures) {
    delete records.captures[c].records;
    delete records.captures[c].options;
  }
  // Updates the log file with a JSON object containing captures, Succss records infos and options.
    if (s.fs.exists(dataLog)) {
      reports = JSON.parse(s.fs.read(dataLog).replace(/^var.*= /g, ''));
  }
  var newReport = {
    id: records.startTime,
    records: records,
    options: s.options
  }
  reports.unshift(newReport);

  return (function() {
      s.fs.write(dataLog, varTricks + JSON.stringify(reports), 'w');
      // Copy the reporter webpage interface to current directory if necessary:
      if (!s.fs.exists('succss-reports/index.html')) {
        s.fs.copy(s.options.npmpath + '/succss-reports/index.html', 'succss-reports/index.html');
      }
      s.echo('Report: file://' + s.fs.absolute('.') + '/succss-reports/index.html#/' + s.options.action, 'INFO_BAR');
  })();
}