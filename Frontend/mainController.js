var mainController = function($scope, $http, $interval, $timeout, $cookies, $window) {
  // dynamically loaded file path
  $scope.navs = {url: "navs.view.html"};
  $scope.recmd = {url: "recommends.view.html"};
  $scope.login_view = {url: "login.view.html"};
  $scope.register_view = {url: "register.view.html"};
  $scope.post_view = {url: "post.view.html"};
  $scope.msg_view = {url: "messenger.view.html"};
  $scope.search = {url:"search.html"};

  // register messenger and watch messages
  $scope.messenger = {};
  $scope.new_message_num = 0;
  $scope.$watch('messenger.msgNum', function() {
    $scope.scroll_down();
  });

  $scope.recent_chat = function() {
    $http.get("/users/contacts")
    .then(function(response) {
      if (response.data.feedback == "Success") {
        response.data.contacts.forEach(function(uid) {
          if ($scope.recent == undefined) {
            $scope.recent = {};
          }
          if (!(uid in $scope.recent)) {
            $http.get("/users/" + uid)
            .then(function(name_response) {
              //console.log("Found recent contact: " + name_response.data.user.username);
              $scope.recent[uid] = {'uid': uid, 'name': name_response.data.user.username, 'new': false};
            });
          }
        });
        //console.log($scope.recent);
      } else {
        console.log("Error: cannot get recent contacts")
      }
    });
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
              $scope.new_message_num += 1;
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
    console.log(contact);
    if ($scope.msgUID != contact.uid) {
      $scope.close_chat();

      $scope.msgShow = true;
      $scope.msgUID = contact.uid;

      if ($scope.recent[contact.uid].new == true) {
        $scope.new_message_num -= 1;
      }
      $scope.recent[contact.uid].new = false;

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
    $interval.cancel(receive_msg_promise);
  };

  $scope.rcv_msg = function() {
    $http.get("/messages/" + $scope.msgUID)  // TODO change to uid
    .then(function(response) {
      //console.log(response);
      response.data.message.messages.forEach(function(msg) {
        var timestamp = msg[2];
        if (timestamp > $scope.lastViewTime) {
          var sender_id = msg[0] == 1 ? response.data.message.uid1 : response.data.message.uid2;
          $scope.msgList.push({
            "to_send": sender_id == $scope.uid,
            "content": msg[1],
            "time": get_formatted_time(timestamp),    // TODO: change time
          });
          $scope.lastViewTime = timestamp;
        }
      });
      var objDiv = document.getElementById("msg-panel");
      if (objDiv.scrollTop + 400 > objDiv.scrollHeight) {
        $timeout($scope.scroll_down, 50);
      }
    });
  };

  $scope.send_msg = function(msgContent) {
    if (msgContent != "") {
      // update UI
      //console.log($("#btn-input").val());
      $("#btn-input").val("");

      //$scope.msgList.push({
      //  "to_send": true,
      //  "content": msgContent,
      //  "time": get_formatted_time(new Date()),    // TODO: change time
      //});

      //console.log($scope.msgNum);
      $scope.messenger.msgNum += 1;
      //console.log($scope.msgNum);

      console.log($scope.msgUID);
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
    $timeout($scope.check_msg, 50);
  }

  var check_msg_promise;
  $scope.sign_in = function(client_name) {
    $http.get("/users/self")
    .then(function(response) {
      $scope.uid = response.data.user._id;

      $scope.client_name = client_name;
      $scope.signed_in = true;
      $cookies.put("logged_in", client_name);

      $scope.update_messenger();
      check_msg_promise = $interval($scope.update_messenger, 1000);
      if (localStorage.getItem("is_manual_login")) {
        localStorage.removeItem("is_manual_login");
        $window.location.reload();
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




  // post modal controller function
  $scope.get_category_list = function() {
    $http.get("/categories")
    .then(function(response) {
      $scope.categories = response.data.categories;
      $scope.selectedCategory = $scope.categories[0]._id;
    });
  };

  // get pic file
  $scope.fd = new FormData();
  $scope.uploadFile = function(files) {
    //Take the first selected file
    $scope.fd.append("pic", files[0]);
    console.log(files[0]);
    console.log($scope.fd.get("pic"));
  };

  // data initialize
  $scope.price = 0;
  $scope.quantity = 0;
  $scope.title = "";
  $scope.description = "";
  $scope.condition = "";
  $scope.tags = "";

  $scope.validatePrice = function(dirty){
    if($scope.price == undefined)
    {
      $scope.priceValid = false;
      $scope.priceErrorMsg = 'Price is required';
    }
    else if($scope.price < 0){
      $scope.priceValid = false;
      $scope.priceErrorMsg = 'Price is not allowed to be negative number';
    }
    else{
      $scope.priceValid = true;
    }
  }

  $scope.validateTitle = function(dirty){
    if($scope.title == undefined)
    {
      $scope.titleValid = false;
      $scope.priceErrorMsg = 'Title is required';
    }
    else {
      $scope.titleValid = true;
    }
  }

  $scope.validateQuantity = function(dirty){
    if($scope.quantity == undefined || $scope.quantity <= 0)
    {
      $scope.quantityValid = false;
      $scope.quantityErrorMsg = 'Positive interger quantity is required';
    }

    else{
      $scope.quantityValid = true;
    }
  }

  // verify credential
  if ($cookies.get("logged_in") != undefined) {

    // submit the data
    $scope.post_item = function() {
      console.log("post item");
      // generage data
      var tagarray = $scope.tags.split(",");
      $scope.attributes = {
        'title': $scope.title,
        'description': $scope.description,
        'condition': $scope.condition
      };

      // post item to server
      $http.post("/items/create", {
        'cid': '58e8d54d1a9a4056cf810714',
        'price': $scope.price.toString(),
        'quantity': $scope.quantity.toString(),
        'tags': JSON.stringify(tagarray),
        'attributes': JSON.stringify({
          "title": $scope.title,
          "description": $scope.description,
          "condition": $scope.condition
        })
      })
      .then(function mySuccess(response) {
        console.log(response);
        console.log("post item");
        $scope.response = response;
        if ($scope.response.data.feedback == "Success") {
          // successfully post
          // if there is a picture
          if ($scope.fd.get('pic')){
            // send pic to server
            $http.post('/items/' + $scope.response.data.item._id + '/upload', $scope.fd,
            {
              withCredentials: true,
              headers: {'Content-Type': undefined },
              transformRequest: angular.identity
            })
            .then(function uploadSuccess(fileResponse) {
              console.log(fileResponse);
              if (fileResponse.data.feedback == "Success") {
                window.location = "item_detail.html";
              }
            })
          }
        }
      })
    }
  }

  $scope.get_category_list();

};
