angular.module('profileApp', ['ngRoute', 'ngCookies'])
.controller('loadController', function($scope, $http, $cookies) {
  $scope.cancel = "profile.view.html";

  // verify credential
  if ($cookies.get("logged_in") == "true") {
    console.log("loged in");
    // GET self information
    $http.get("/users/self")
    .then(function(response) {
      // feedback: success or fail
      $scope.feedback = response.data.feedback;
      console.log($scope.feedback);
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

  // update profile information
  $scope.submit = function() {
    console.log($scope.feedback);
    if ($scope.feedback == "Success") {
      $http.put('/users/update',
        {
            "nickname": $scope.profile.nickname,
            "description": $scope.profile.description,
            "phone": $scope.profile.phone,
            "wechat": $scope.profile.wechat,
            "email": $scope.profile.email,
            "qq": $scope.profile.qq,
            "facebook": $scope.profile.facebook
        })
      .then(function(response) {
        console.log(response);
        if ($scope.feedback == "Success") {
          console.log("Update success!");
          window.location = "profile.view.html";
        }
        else {
          console.log("Fail to update!");
          window.location = "index.html";
        }
      })
    }
    else {
      console.log("Doesn't connect server!");
      window.location = "index.html";
    }
  }

  // cancel
  $scope.cancel = "index.html";


});
