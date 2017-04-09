var mainController = function($scope, $http, $interval, $timeout, $cookies, $window) {
  // dynamically loaded file path
  $scope.navs = {url: "navs.view.html"};
  $scope.recmd = {url: "recommends.view.html"};
  $scope.login_view = {url: "login.view.html"};
  $scope.register_view = {url: "register.view.html"};
  $scope.msg_view = {url: "messenger.view.html"};

  // register messenger and watch messages
  $scope.messenger = {};
  $scope.$watch('messenger.msgNum', function() {
    $scope.scroll_down();
  });

  // check message buffer for new messages
  $scope.check_msg = function() {
    $http.get("/users/new_messages")
    .then(function(response) {
      console.log(response);
      if (response.data.feedback == "Failure") {
        console.log("Error when checking for new messages")
      }
      else if (response.data.msg_buf.length == 0) {
        console.log("No new message");
      } else {
        if ($scope.contact == undefined) {
          $scope.contact = {};
        }
        response.data.msg_buf.forEach(function(uid) {
          if (uid in $scope.contact) {
            // do nothing
          } else {
            // get user-info by uid
            $http.get("/users/" + uid)
            .then(function(response) {
              console.log("New messages from " + response.data.user.username);
              $scope.contact[uid] = {'uid': uid, 'name': response.data.user.username};
            });
          }
          console.log($scope.contact);
        });
      }
    });
  };

  // open a chat window
  $scope.start_chat = function(contact) {
    $scope.msgShow = true;
    $scope.chatUID = contact.uid;
    $scope.chatName = contact.name;
    $scope.msgList = [];

    // testing uid
    $scope.msgUID = "58e7896bb482cb0f902a55fc"; //mjust

    console.log("chat start")
    $scope.rcv_msg();
  };

  $scope.rcv_msg = function() {
    $http.get("/messages/" + "58e5fbe40eb7a21abbbafe0d")  // TODO change to uid
    .then(function(response) {
      console.log(response);
      response.data.message.messages.forEach(function(msg) {
        $scope.msgList.push({
          "to_send": false,
          "content": msg[1],
          "time": 0,    // TODO: change time
        });
      })

    });


  }

  $scope.send_msg = function(msgContent) {
    if (msgContent != "") {
      // update UI
      //console.log($("#btn-input").val());
      $("#btn-input").val("");

      $scope.msgList.push({
        "to_send": true,
        "content": msgContent,
        "time": 0,    // TODO: change time
      });

      //console.log($scope.msgNum);
      $scope.messenger.msgNum += 1;
      //console.log($scope.msgNum);

      console.log($scope.msgUID);
      $http.post("/messages/" + $scope.msgUID, {
        content: msgContent,
      })
      .then(function(response) {
        if (response.data.feedback == "Success") {
          console.log("'" + msgContent + "'" + " sent");
        } else {
          console.log(response);
          console.log("Failed to send message");
        }
      });
    }
  };

  // testing
  //$scope.msgList = [];
  //$scope.msgUID = "58e7896bb482cb0f902a55fc"; //mjust
  //$scope.send_msg('test2');

  $scope.scroll_down = function() {
    $timeout(function() {
      var objDiv = document.getElementById("msg-panel");
      objDiv.scrollTop = objDiv.scrollHeight;
    }, 50)
  }

  var promise;
  $scope.sign_in = function(client_name) {
    $scope.client_name = client_name;
    $scope.signed_in = true;
    $cookies.put("logged_in", client_name);

    //promise = $interval($scope.check_msg, 5000);
    $scope.check_msg();
  };
  $scope.sign_out = function() {
    $http.get("/users/logout")
    .then(function(response) {
      console.log(response);
      if (response.data.feedback == "Success") {
        $scope.signed_in = false;
        $cookies.remove("logged_in");
        $interval.cancel(promise);
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
