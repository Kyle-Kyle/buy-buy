angular.module('profileApp', ['ngRoute', 'ngCookies'])
.controller('loadController', function($scope, $http, $cookies, $timeout) {

  // for item-list post-adjustment
  $scope.is_profile = true;

  // dynamic loading
  $scope.user_followees={url:"user_list.html"};
  $scope.item_list={url:"item_list.html"};
  $scope.user_info={url:"user_info.html"};

  // verify credential
  $scope.user_name = $cookies.get("logged_in");

  // vistor
  $scope.owner_id = location.search.substring(1);

  if ($scope.owner_id == "") {
    console.log("not a vistor");

    // get user info
    if ($scope.user_name != undefined) {
      console.log("loged in");

      // GET self information
      $http.get("/users/self")
      .then(function(response) {

        // feedback: success or fail
        $scope.user = response.data;
        console.log($scope.user);

      });
    }
  }
  else {
    console.log("vistor");


    // get user info
    if ($scope.user_name != undefined) {
      console.log("loged in");

      // GET owner_id info
      $http.get('/users/' + $scope.owner_id)
      .then(function(response) {

        // feedback
        $scope.user = response.data;
        console.log($scope.user);
      })
    }

  }

  $scope.items = [];
  $scope.users = [];

  // get following info
  if ($scope.user_name != undefined) {
    console.log("WTF");
    console.log($scope.owner_id);
    if ($scope.owner_id == "") {
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
        });
      }

    }

    $scope.getFollowee = function() {
      var follist = [];
      var followees = [];
      // get followee
      $http.get('/follow/followees' + $scope.user._id)
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

  if ($scope.owner_id != "") {

    if ($scope.user_name != undefined) {
      $scope.Follow = function() {
        $http.get('/follow/' + $scope.owner_id)
        .then(function(response) {
          console.log(response);
          $scope.follow_message = "You have followed him";
        })
      }

      $scope.Unfollow = function() {
        $http.get('/unfollow/' + $scope.owner_id)
        .then(function(response) {
          console.log(response);
          $scope.follow_message = "You have unfollowed him";
        })
      }
    }
  }


});
