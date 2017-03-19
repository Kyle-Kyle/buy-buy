angular.module('indexApp')
  .controller('loadController', function($scope) {
    $scope.navs = {url: "navs.view.html"};
    $scope.recmd = {url: "recommends.view.html"};
    $scope.login_view = {url: "login.view.html"};
  });

/*
var indexApp = angular.module('indexApp');
(function(app) {
  "use strict";
	app.controller('loadController', function($scope) {
    $scope.navs.url = "navs.view.html";
    $scope.recmd.url = "recmd.view.html";
  });
})(indexApp);
*/
