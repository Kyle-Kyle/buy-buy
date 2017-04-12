angular.module('profileApp', ['ngRoute', 'ngCookies'])
.controller('loadController', function($scope, $http, $cookies, $timeout) {

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
        console.log($scope.user);
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
      for (tran in $scope.user.user.history) {

        $http.get('/transactions/' + $scope.user.user.history[tran])
        .then(function(response) {
          console.log(response);
          if (response.data.transaction.status_code == 1) {
          var tr = {};
          tr.tid = $scope.user.user.history[tran];
          tr.buyer_id = response.data.transaction.buyer_id;
          tr.iid = response.data.transaction.iid;
          t_list.push(tr);
          console.log(tr);
        }
        })
      }
      $timeout(function() {
        var tra;
        for (tra in t_list) {
          // get user
          var t = {};
          $http.get('/users/' + t_list[tra].buyer_id)
          .then(function(response) {
            t.buyer = response.data.user.username;
          });
          //get item
          $http.get('/items/' + t_list[tra].iid)

          .then(function(response) {
            console.log(response);
            if (response.data.feedback == "Success") {
              t.item = response.data.item.attributes.title;
              t.tid = t_list[tra].tid;
              $scope.tid_list.push(t);
            }
          })
        }

      }, 1000)

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
    $http.get('/follow/' + follow_id)
    .then(function(response) {
      $scope.getFollowee();
      $scope.getFollower();
    })
  }

  $scope.Unfollow = function(unfollow_id) {
    $http.get('/unfollow/' + unfollow_id)
    .then(function(response) {
      $scope.getFollowee();
      $scope.getFollower();
    })
  }

  $scope.acceptTransaction = function(tid) {
    console.log(tid);
    if ($scope.owner_id == "") {

      // confirm
      $http.get('/transactions/' + tid + '/confirm')
      .then(function(response) {
        console.log(response);
      })

    }
  }

  $scope.updateProfile = function() {
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
          window.location = "profile.html";
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
      })
    }
  }

});
