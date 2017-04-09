angular.module('profileApp', ['ngRoute', 'ngCookies'])
.controller('loadController', function($scope, $http, $cookies) {
  if ($cookies.get("logged_in") == "true") {
    console.log("loged in");
    // GET self information
    $http.get("/users/self")
    .then(function(response) {
      // feedback: success or fail
      $scope.profile_feedback = response.feedback;
      console.log(response);
      try {
        // get profile information
        $scope.profile = response.data.user.profile;

        // get static info
        $scope.username = response.data.user.username;
        $scope.email = response.data.user.email;
        // $scope._uid = response.data.user._id;
      } catch(err) {
        console.log("fail to load user information");
      }
    });
  }

  $scope.backToIndex = function() {
    window.location = "index.html";
  }
});
