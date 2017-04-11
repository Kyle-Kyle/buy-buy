var searchController = function($scope, $http) {

  // search filters
  $scope.keyword = undefined;
  $scope.minprice = undefined;
  $scope.maxprice = undefined;
  $scope.cid = undefined;
  $scope.tags = undefined;

  $scope.goto = function(route) {
    localStorage.setItem('search_route', route);
    window.location.replace('search.html');
  };

  $scope.get_category_list = function() {
    $http.get("/categories")
    .then(function(response) {
      console.log(response);
    });
  };

  $scope.get_search_route = function() {
    return ("/search" +
      "?keyword=" + $scope.keyword +
      ($scope.minprice == undefined ? "" : ("&minprice=" + $scope.minprice)) +
      ($scope.maxprice == undefined ? "" : ("&maxprice=" + $scope.maxprice)) +
      ($scope.cid == undefined ? "" : ("&cid=" + $scope.cid)) +
      ($scope.tags == undefined ? "" : ("&tags=" + $scope.tags)))
  };

  $scope.submit_search = function(route) {
    console.log($( "#slider-range" ));

    $http.get(route)
    .then(function(response) {
      console.log(response);
      if (response.data.feedback == "Success") {
        if (response.data.items.length == 0) {
          $scope.no_match = true;
        } else {
          $scope.no_match = false;
        }
        $scope.items = response.data.items;
        $scope.items.forEach(function(item) {
          item.post_time = "Posted on " + get_formatted_time(item.open_timestamp);
          item.condition_name = get_condition[item.attributes.condition-1];
        });
      } else {
        console.log("Search error");
      }
    });
  };

  var nav_search_route = localStorage.getItem('search_route');
  if (nav_search_route != undefined) {
    $scope.submit_search(nav_search_route);
    localStorage.removeItem('search_route')
  }


  $scope.get_category_list();

};
