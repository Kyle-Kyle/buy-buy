angular.module('loginApp', [])
    .controller('loginController', ['$scope', function($scope) {
      $scope.submit = $http.post("/users/login")
        .then(function(response) {
          $scope.login_feedback = response.data;
          $scope.login_error = response.error_message;
      });
    }]);
