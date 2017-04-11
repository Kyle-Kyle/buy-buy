angular.module('profileApp', ['ngRoute', 'ngCookies'])
.controller('loadController', function($scope, $http, $cookies, $timeout) {

  // for item-list post-adjustment
  $scope.is_profile = true;

  // dynamic loading
  $scope.user_followees={url:"user_list.html"};
  $scope.item_list={url:"item_list.html"};
  $scope.user_info={url:"user_info.html"};

  // verify credential
  $scope.user = $cookies.get("logged_in");

  $scope.users = [];

  // get user info
  if ($scope.user != undefined) {

    // GET self information
    $http.get("/users/self")
    .then(function(response) {

      // feedback: success or fail
      $scope.user = response.data;
      console.log($scope.user);

    });
  }

  $scope.items = [];
  $scope.users = [];

  // get following info
  if ($scope.user != undefined) {

    $scope.getSell = function() {
      var post_item = [];
      // get post item list
      $http.get('/users/self/items')
      .then(function(response) {
        console.log(response);
        console.log('load user items');
        post_item = response.data.items;
        $scope.items = post_item.filter(function(element) {
          return element.qunatity != 0;
        })
        $scope.items.forEach(function(item) {
          item.post_time = get_formatted_time(item.open_timestamp);
          item.condition_name = get_condition[item.attributes.condition-1];
        })
        console.log($scope.items);
        $timeout(set_card_height_responsive, 100);
      });
    }

    $scope.getSold = function() {
      var sold_item = [];
      // get post item list
      $http.get('/users/self/items')
      .then(function(response) {
        console.log(response);
        console.log('load user items');
        sold_item = response.data.items;
        $scope.items = sold_item.filter(function(element) {
          return element.qunatity == 0;
        })
        $scope.items.forEach(function(item) {
          item.post_time = get_formatted_time(item.open_timestamp);
          item.condition_name = get_condition[item.attributes.condition-1];
        })
        console.log($scope.items);
        $timeout(set_card_height_responsive, 100);
      });
    }

    $scope.getFollowee = function() {
      var follist = [];
      var followees = [];
      // get followee
      $http.get('/follow/followees')
      .then(function(response) {
        follist = response.data.followees;
        console.log(response);
      }).then(function(response) {

        // get the detail of every followees
        var f;
        for (f in follist) {
          $https.get('/users/' + f)
          .then(function(response) {
            if (response.feedback == "Success") {
              followees.push(response.user);
            }
          })
        }
      });

      $scope.users = followees;
    }

    $scope.getFollower = function() {
      var follist = [];
      var followers = [];
      // get follower
      $http.get('/follow/followers')
      .then(function(response) {
        follist = response.data.followers;
        console.log(response);
      }).then(function(response) {

        // get the detail of every followers
        var f;
        for (f in follist) {
          $https.get('/users/' + f)
          .then(function(response) {
            if (response.feedback == "Success") {
              followers.push(response.user);
            }
          });
        }
      });
      $scope.users = followers;
    }

  }

  $scope.changeTo = function(url) {
    window.location = url;
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
