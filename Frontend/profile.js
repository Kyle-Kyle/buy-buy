angular.module('profileApp', ['ngRoute', 'ngCookies'])
.controller('loadController', function($scope, $http, $cookies, $timeout, $route) {

  // for item-list post-adjustment
  $scope.is_profile = true;

  // dynamic loading
  $scope.user_list={url:"user_list.html"};
  $scope.item_list={url:"item_list.html"};
  $scope.user_info={url:"user_info.html"};
  $scope.transaction={url:"transaction_list.html"}

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
        $scope.user_contact = {uid: $scope.user.user._id, name: $scope.user.user.username};
      })
    }

  }

  $scope.items = [];
  $scope.users = [];
  $scope.followee = [];

  // get following info
  if ($scope.user_name != undefined) {

    console.log($scope.owner_id);

    $scope.getSell = function() {

      if ($scope.owner_id == "") {
        var post_item = [];
        // get post item list
        $http.get('/users/self/items')
        .then(function(response) {
          console.log('load user items');
          post_item = response.data.items;
          $scope.items = post_item.filter(function(element) {
            return element.qunatity != 0;
          })
          $scope.items.forEach(function(item) {
            item.post_time = get_formatted_time(item.open_timestamp);
            item.condition_name = get_condition[item.attributes.condition-1];
          })
        });
      }
      else {
        var post_item = [];
        $http.get('/users/' + $scope.owner_id + '/items')
        .then(function(response) {
          post_item = response.data.items;
          $scope.items = post_item.filter(function(element) {
            return element.qunatity != 0;
          })
          $scope.items.forEach(function(item) {
            item.post_time = get_formatted_time(item.open_timestamp);
            item.condition_name = get_condition[item.attributes.condition-1];
          })
        })
      }
    }

    $scope.tid_list = [];
    var t_list = [];
    $scope.getTransaction = function() {
      var tran;
      $http.get('/users/self/transactions')
      .then(function(response) {
        $scope.tid_list = response.data.reverse().filter(function(ele) {
          return ele.status_code == 1;
        });
        console.log($scope.tid_list);
      })

      }



    $scope.getFollowee = function() {
      if ($scope.owner_id == "") {
        var follist = [];
        $scope.followee = [];
        // get followee
        $http.get('/follow/followees')
        .then(function(response) {
          follist = response.data.followees;
          console.log(response);
        }).then(function(response) {

          // get the detail of every followees
          var f;
          for (f in follist) {
            console.log(f);
            $http.get('/users/' + follist[f])
            .then(function(response) {
              console.log(response)
              if (response.data.feedback == "Success") {
                $scope.followee.push(response.data.user);
              }
            })
          }
          $scope.users = $scope.followee;
          console.log($scope.users);
        });
      }
      else {
        console.log("not allowed");
      }

    }

    $scope.getFollower = function() {
      if ($scope.owner_id == "") {
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
            $http.get('/users/' + follist[f])
            .then(function(response) {
              if (response.data.feedback == "Success") {
                followers.push(response.data.user);
              }
            });
          }
        });
      }
      else {
        console.log("not allowed");
      }
      $scope.users = followers;
    }

  }

  $scope.isFollowed = function(u_id) {
    var result = $scope.followee.filter(function(ele) {
      return ele._id == u_id;
    })
    if (result.length != 0) {
      return true;
    }
    else {
      return false;
    }
  }

  $scope.goProfile = function(u_id) {
    window.location = "profile.html?" + u_id;
  }

  $scope.changeTo = function(url) {
    window.location = url;
  }


  $scope.Follow = function(follow_id) {
    console.log(follow_id);
    $http.get('/follow/' + follow_id)
    .then(function(response) {
      console.log("follow successfully");
      window.location = location.href;
    })
  }

  $scope.Unfollow = function(unfollow_id) {
    $http.get('/unfollow/' + unfollow_id)
    .then(function(response) {
      window.location = location.href;
    })
  }

  $scope.acceptTransaction = function(tid) {
    console.log(tid);
    if ($scope.owner_id == "") {

      // confirm
      $http.get('/transactions/' + tid + '/confirm')
      .then(function(response) {
        console.log(response);
        $scope.getTransaction();
        $route.reload();
      })

    }
  }

  $scope.submit = function() {
    if ($scope.owner_id == "") {
      $http.put('/users/update',
        {
            "nickname": "",
            "description": $scope.user.user.profile.description,
            "phone": $scope.user.user.profile.phone,
            "wechat": "",
            "email": $scope.user.user.profile.email,
            "qq": "",
            "facebook": $scope.user.user.profile.facebook
        })
      .then(function(response) {
        console.log(response);
        if ($scope.feedback == "Success") {
          console.log("Update success!");
          $scope.getTransaction();
        }
        else {
          console.log("Fail to update!");

        }
      })
    }
  }
  $scope.declineTransaction = function(tid) {
    console.log(tid);
    if ($scope.owner_id == "") {

      $http.get('/transactions/' + tid + '/reject')
      .then(function(response) {
        console.log(response);
        $scope.getTransaction();
        $route.reload();
      })
    }
  }

});
