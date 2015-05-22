
/**
 * @param {Object} capture state
 * @returns {String} The default path for writing diff images.
 */
self.defaultDiffDirName = function(capture) {
  return SuccssRecords.startDate.getFullYear() + '-' +
          (SuccssRecords.startDate.getMonth() + 1) + '-' +
          SuccssRecords.startDate.getDate() + '--' +
          SuccssRecords.startDate.getHours() + '-' +
          SuccssRecords.startDate.getMinutes() + '-' +
          SuccssRecords.startDate.getSeconds() +
          '/' + capture.page.name + '--' + capture.viewport.name +
          '/' + capture.basePath.replace(/^\.?\//, '').replace(checkDir+'/', '');
}

/**
 * Increments the current Succss run error count, print the related message.
 * @param {String} error message
 */
self.catchErrors = function(err) {
  SuccssRecords.exitcode = 1;
  SuccssRecords.errors.push(JSON.stringify(err));
  self.echo(err, 'ERROR');
}