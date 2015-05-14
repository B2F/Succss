/**
 * @file
 * Utility class to create a log file containing succss run informations.
 *
 * @returns {SuccssReporter}
 */
exports.init = function(records, Succss) {

  var reports = Array();
  var dataLog = './succss-reports/runs.json.inc';
  var varTricks = 'var succssReports = ';

  var getStatus = function() {
    if (!records || !records.errors) return 'incomplete';
    return !records.errors.length ? 'success' : 'failure';
  }

  // Cleaning captures redundancy (useful properties for hooks but dupes in reports):
  for (var c in records.captures) {
    delete records.captures[c].records;
    delete records.captures[c].options;
  }
  // Updates the log file with a JSON object containing captures, Succss records infos and options.
    if (Succss.fs.exists(dataLog)) {
      reports = JSON.parse(Succss.fs.read(dataLog).replace(/^var.*= /g, ''));
  }
  var newReport = {
    id: records.startTime,
    status: getStatus(),
    records: records,
    options: Succss.allOptions
  }
  reports.unshift(newReport);

  return {

    /**
     * Writes reports to the dataLog file.
     */
    report : function() {
      Succss.fs.write(dataLog, varTricks + JSON.stringify(reports), 'w');
      // Copy the reporter webpage interface to current directory if necessary:
      if (!Succss.fs.exists('succss-reports/index.html')) {
      Succss.fs.copy(Succss.allOptions.npmpath + '/succss-reports/index.html', 'succss-reports/index.html');
      }
      Succss.echo('Report: file://' + Succss.fs.absolute('.') + '/succss-reports/index.html#/' + Succss.allOptions.action, 'INFO_BAR');
    }
  }
}