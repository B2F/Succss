/**
 * @file
 */
var succssReportsApp = angular.module('succssReportsAppCtrl', ['ngRoute']);
succssReportsApp.config(['$routeProvider', function($routeProvider) {
  $routeProvider.
    when('/check/', {
//      templateUrl:'check-report.html',
      controller:'ReportCtrl',
      link:function() {return 'hit' }
    }).
    when('/ref/', {
      templateUrl:'references-report.html',
      controller:'ReportCtrl'
    }).
    otherwise({
      redirectTo: '/check/:report'
    })
}])
succssReportsApp.controller('ReportCtrl', ['$scope', function($scope) {
  $scope.reports = succssReports;
}]);