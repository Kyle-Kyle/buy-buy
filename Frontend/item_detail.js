angular.module('itemApp')
.controller('loadController', function($scope, $cookies, $http) {

  $scope.user = $cookies.get("logged_in");

  $scope.condition = "";
  // get item_id
  $scope.item = {};
  $scope.item_id = location.search.substring(1);
  console.log($scope.item_id);

  // get detail information
  $http.get('/items/' + $scope.item_id)
  .then(function(response) {
    $scope.item = response.data.item;
    console.log($scope.item);
    switch($scope.item.attributes.condition) {
      case "1":
        $scope.condition = "Like New";
        break;
      case "2":
        $scope.condition = "Very Good";
        break;
      case "3":
        $scope.condition = "Good";
        break;
      case "4":
        $scope.condition = "Acceptable";
        break;
      case "5":
        $scope.condition = "Bad";
        break;
    }
  })

  // get comments
  $http.get('/items/' + $scope.item_id + "/comments")
  .then(function(response) {
    $scope.comments_array = response.data.comments.reverse();
  })

  // add comment
  $scope.addComment = function() {
    console.log("add comment" + $scope.comments);
    if ($scope.user == undefined) {
      $scope.comment_error = "you are not logged in now!";
    }
    else {
      $http.post("/items/" + $scope.item_id + "/comments", {
        content: $scope.comments
      })
      .then(function(response) {
        console.log(response);
        window.location = "item_detail.html?" + $scope.item_id;
      })
    }
  }

})
