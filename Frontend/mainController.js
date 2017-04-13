var mainController = function($scope, $http, $interval, $timeout, $cookies, $window) {
  // dynamically loaded file path
  $scope.navs = {url: "navs.view.html"};
  $scope.recmd = {url: "recommends.view.html"};
  $scope.login_view = {url: "login.view.html"};
  $scope.register_view = {url: "register.view.html"};
  $scope.post_view = {url: "post.view.html"};
  $scope.msg_view = {url: "messenger.view.html"};
  $scope.search = {url:"search.html"};

  // init messenger and watch for new messages
  $scope.messenger = {};
  $scope.has_new_messages = false;
  $scope.recent = {};
  $scope.$watch('messenger.msgNum', function() {
    $scope.scroll_down();
  });

  // get recent contact list
  $scope.recent_chat = function() {
    $http.get("/users/contacts")
    .then(function(response) {
      console.log(response)
      if (response.data.feedback == "Success") {
        response.data.contacts.forEach(function(uid) {
          if (!(uid in $scope.recent)) {
            $http.get("/users/" + uid)
            .then(function(name_response) {
              $scope.recent[uid] = {'uid': uid, 'name': name_response.data.user.username, 'new': false};
              console.log($scope.recent)
            });
          }
        });
        //console.log($scope.recent);
      } else {
        console.log("Error: cannot get recent contacts")
      }
    });
  }

  $scope.get_recent_chat_num = function() {
    return Object.keys($scope.recent).length;
  }

  // notify if any user has sent a new message to you
  $scope.update_main_notification = function() {
    for (user in $scope.recent) {
      if ($scope.recent[user].new == true) {
        $scope.has_new_messages = true;
        return;
      }
    }
    $scope.has_new_messages = false;
  }

  // check message buffer for new messages
  $scope.check_msg = function() {
    $http.get("/users/new_messages")
    .then(function(response) {
      //console.log(response);
      if (response.data.feedback == "Failure") {
        console.log("Error when checking for new messages")
      }
      else if (response.data.msg_buf.length == 0) {
        console.log("No new message");
      } else {
        console.log("You got new message")
        response.data.msg_buf.forEach(function(uid) {
          if (uid in $scope.recent) {
            if (uid != $scope.msgUID) {
              $scope.recent[uid].new = true;
              $scope.update_main_notification();
            }
          } else {
            console.log("Error: new messages from anonymous ID: " + uid);
          }
        });
      }
    });
  };

  // open a chat window
  var receive_msg_promise;
  $scope.start_chat = function(contact) {
    if ($scope.msgUID != contact.uid) {
      $scope.close_chat();

      $scope.msgShow = true;
      $scope.msgUID = contact.uid;

      // check if the user is in your recent contact list
      if (contact.uid in $scope.recent) {
        if ($scope.recent[contact.uid].new == true) {
          $scope.recent[contact.uid].new = false;
          $scope.update_main_notification();
        }
      } else {
        $scope.recent[contact.uid] = {'uid': contact.uid, 'name': contact.name, 'new': false};
      }

      $scope.chatName = contact.name;
      $scope.lastViewTime = 0;
      $scope.msgList = [];

      console.log("chat start")
      $scope.rcv_msg();
      $timeout($scope.scroll_down, 50);
      receive_msg_promise = $interval($scope.rcv_msg, 1000);
    }
  };

  $scope.close_chat = function() {
    $scope.msgShow = false;
    $scope.msgUID = undefined;
    $scope.chatName = undefined;
    if (receive_msg_promise) {
      $interval.cancel(receive_msg_promise);
    }
  };

  $scope.rcv_msg = function() {
    $http.get("/messages/" + $scope.msgUID)
    .then(function(response) {
      // push new messages to messenger window
      response.data.message.messages.forEach(function(msg) {
        var timestamp = msg[2];
        if (timestamp > $scope.lastViewTime) {
          var sender_id = msg[0] == 1 ? response.data.message.uid1 : response.data.message.uid2;
          $scope.msgList.push({
            "to_send": sender_id == $scope.uid,
            "content": msg[1],
            "time": get_formatted_time(timestamp),
          });
          $scope.lastViewTime = timestamp;
        }
      });

      // auto-scroll to the newest message
      var objDiv = document.getElementById("msg-panel");
      if (objDiv.scrollTop + 400 > objDiv.scrollHeight) {
        $timeout($scope.scroll_down, 50);
      }
    });
  };

  $scope.send_msg = function(msgContent) {
    if (msgContent != "") {
      // update UI
      $("#btn-input").val("");
      $scope.messenger.msgNum += 1;

      $http.post("/messages/" + $scope.msgUID, {
        content: msgContent,
      })
      .then(function(response) {
        if (response.data.feedback == "Success") {
          $scope.rcv_msg();
          console.log("'" + msgContent + "'" + " sent");
        } else {
          console.log(response);
          console.log("Failed to send message");
        }
      });
    }
  };

  $scope.scroll_down = function() {
    $timeout(function() {
      var objDiv = document.getElementById("msg-panel");
      objDiv.scrollTop = objDiv.scrollHeight;
    }, 50)
  }

  $scope.update_messenger = function() {
    $scope.recent_chat();
    $timeout($scope.check_msg, 100);
  }

  var check_msg_promise;
  $scope.sign_in = function(client_name) {
    $http.get("/users/self")
    .then(function(response) {
      if (response.data.feedback == "Success") {
        $scope.uid = response.data.user._id;

        $scope.client_name = client_name;
        $scope.signed_in = true;
        $cookies.put("logged_in", client_name);

        //$timeout($scope.update_messenger, 1000);
        check_msg_promise = $interval($scope.update_messenger, 1000);
        if (localStorage.getItem("is_manual_login")) {
          localStorage.removeItem("is_manual_login");
          $window.location.reload();
        }
      }
    })
  };
  $scope.sign_out = function() {
    $http.get("/users/logout")
    .then(function(response) {
      console.log(response);
      if (response.data.feedback == "Success") {
        $scope.signed_in = false;
        $cookies.remove("logged_in");
        $interval.cancel(check_msg_promise);
      } else {
        console.log("logout failure")
      }
    });
    $window.location.reload();
  };

  if ($cookies.get("logged_in") != undefined) {
    $scope.sign_in($cookies.get("logged_in"));
  }
};
