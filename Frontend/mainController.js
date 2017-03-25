var mainController = function($scope) {
  $scope.navs = {url: "navs.view.html"};
  $scope.recmd = {url: "recommends.view.html"};
  $scope.login_view = {url: "login.view.html"};
  $scope.register_view = {url: "register.view.html"};

  //TODO: check cookies for login session

  $scope.signed_in = false;

  $scope.sign_in = function() {
    $scope.signed_in = true;
  }
}
