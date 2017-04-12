angular.module('updateItemApp')
.controller('updateItemController', function($scope, $http, $cookies, $interval) {

  // data initialize
  $scope.price = 0;
  $scope.quantity = 0;
  $scope.title = "";
  $scope.description = "";
  $scope.condition = "";
  $scope.tags = "";

  // get item id
  $scope.item_id = location.search.substring(1);

  // get item details
  $http.get('/items/' + $scope.item_id)
  .then(function(response) {
    console.log(response);
    $scope.price = Number(response.data.item.price);
    $scope.quantity = Number(response.data.item.quantity);
    $scope.title = response.data.item.attributes.title;
    $scope.description = response.data.item.attributes.description;
    $scope.condition = response.data.item.attributes.condition;
    $scope.category = response.data.item.cid.name;
    $scope.tags = response.data.item.tags;
    console.log($scope.tags);
  });

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
  $scope.user = $cookies.get("logged_in");

  $scope.categories = [];
  // get category list
  $http.get("/categories")
  .then(function(response) {
    $scope.categories = response.data.categories;
    console.log($scope.categories);
  })


  // get pic file
  $scope.uploadFile = function(files) {
    //Take the first selected file
    var fd = new FormData();
    fd.append("pic", files[0]);
    console.log(files[0]);

    // upload img

    if ($scope.user != undefined) {
      // update image
      $http.post('/items/' + $scope.item_id + '/upload', fd,
      {
        withCredentials: true,
        headers: {'Content-Type': undefined },
        transformRequest: angular.identity
      })
      .then(function uploadSuccess(fileResponse) {
        console.log(fileResponse);
        if (fileResponse.data.feedback == "Success") {
          console.log("upload image successfully");
          $scope.errormessge = "upload successfully";
        }
      })
    }
    else {
      $scope.errormessge = "please login before any actions";
    }
  }

  // delete the item
  $scope.delete = function() {
    if ($scope.user != undefined) {
      $http.delete('/items/' + $scope.item_id)
      .then(function(response) {
        if (response.data.feedback == "Success") {
          window.location = "profile.html";
        }
        else {
          window.location = "item_detail.html?" + $scope.item_id;
        }
      })
    }
  }
  // submit the data
  $scope.update_item = function() {
    if ($scope.user != undefined) {
      console.log("update item");
      // generage data
      var tagarray = $scope.tags;
      $scope.attributes = {
        'title': $scope.title,
        'description': $scope.description,
        'condition': $scope.condition
      };

      console.log({
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
      console.log($scope.item_id)
      // post item to server
      $http.put("/items/" + $scope.item_id, {
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
      .then(function mySuccess(response) {
        console.log(response);
        console.log("update item");
        $scope.response = response;
        if ($scope.response.data.feedback == "Success") {
          window.location = "item_detail.html?" + $scope.response.data.item._id;
        }
      })
    }
    else {
      $scope.errormessge = "please login before any actions";
    }
  }
});
