var postController = function($scope, $http, $cookies) {
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
      $scope.titleErrorMsg = 'Title is required';
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
      console.log($scope.selectedCategory);

      // post item to server
      $http.post("/items/create", {
        'cid': $scope.selectedCategory,
        'price': $scope.price.toString(),
        'quantity': $scope.quantity.toString(),
        'tags': JSON.stringify(tagarray),
        'attributes': JSON.stringify({
          "title": $scope.title,
          "description": $scope.description,
          "condition": $scope.condition
        })
      })
      .then(function(response) {
        console.log(response);
        console.log("post item");
        $scope.response = response;
        if ($scope.response.data.feedback == "Success") {
          var iid = $scope.response.data.item._id;
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
                window.location.href = 'item_detail.html?' + iid;
              }
            })
          } else {
            window.location.href = 'item_detail.html?' + iid;
          }
        }
      })
    }
  }

  $scope.get_category_list();
}
