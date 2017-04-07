var mainController = function($scope, $http, $interval, $cookies) {
  // dynamically loaded file path
  $scope.navs = {url: "navs.view.html"};
  $scope.recmd = {url: "recommends.view.html"};
  $scope.login_view = {url: "login.view.html"};
  $scope.register_view = {url: "register.view.html"};
  $scope.msg_view = {url: "messenger.view.html"};

  // check message buffer for new messages
  $scope.check_msg = function() {
    $http.get("/users/new_messages")
    .then(function(response) {
      console.log(response);
      if (response.data == "") {
        console.log("No new message");
      } else {
        // read message buffer
      }
    });
  };

  // open a chat window
  $scope.start_chat = function() {
    console.log("chat start")
  };

  $scope.send_msg = function(msgContent) {
    if (msgContent != "") {
      console.log("'" + msgContent + "'" + " sent");
    }
  };




  var promise;
  $scope.sign_in = function() {
    $scope.signed_in = true;
    $cookies.put("logged_in", "true");
    promise = $interval($scope.check_msg, 5000);
  };
  $scope.sign_out = function() {
    // TODO send http request to server


    $scope.signed_in = false;
    $cookies.remove("logged_in");
    $interval.cancel(promise);
  };

  if ($cookies.get("logged_in") == "true") {
    $scope.sign_in();
  }
};
