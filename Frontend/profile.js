// demo item list
// user info:
// 1. user.userName
// 2. user.email
// 3. user.userDes
// 4. user.soldItem
// 5. user.sellingItem
// 6. user.buyingHis

class item {
  constructor(name, url, hide) {
    this.name = name;
    this.url = url;
    this.hide = hide;
  }
}

var item1 = new item("book", "#", "false");
var item2 = new item("textbook", "#", "false");
var item3 = new item("noval", "#", "false");
var item4 = new item("new item", "#", "false");
var itemList = [item1, item2, item3];
var itemList2 = [item1, item2];
var itemList3 = [item1, item2, item3, item4];
var url = "#";

// module function
angular.module('profileApp')
  .controller('loadController', function($scope, $http) {
    $scope.user_list={url:"user_list.html"};
    $scope.item_list={url:"item_list.html"};
    $scope.user_info={url:"user_info.html"};

    $scope.userName = "Lyn";
    $scope.email = "hechevr@gmail.com";
    $scope.userDes = "csci3100";
    $scope.sellingItem = itemList;
    if ($scope.sellingItem.length > 3) {
      $scope.sellingSeeMore = "false";
      $scope.sellingSeeMoreUrl = url;
    } else {
      $scope.sellingSeeMore = "true";
      for (i = $scope.sellingItem.length; i <= 3; i++) {
        $scope.sellingItem.push(new item("empty", "#", "true"));
      }
    }
    $scope.soldItem = itemList2;
    if ($scope.soldItem.length > 3) {
      $scope.soldSeeMore = "false";
      $scope.soldSeeMoreUrl = url;
    } else {
      $scope.soldSeeMore = "true";
      for (i = $scope.soldItem.length; i <= 3; i++) {
        $scope.soldItem.push(new item("empty", "#", "true"));
      }
    }
    $scope.buyingHis = itemList3;
    if ($scope.buyingHis.length > 3) {
      $scope.buySeeMore = "false";
      $scope.buySeeMoreUrl = url;
    } else {
      $scope.buySeeMore = "true";
      for (i = $scope.buyingHis.length; i <= 3; i++) {
        $scope.buyingHis.push(new item("empty", "#", "true"));
      }
    }
  });
