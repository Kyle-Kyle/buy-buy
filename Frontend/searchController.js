var searchController = function($scope, $http, $timeout) {
  // search filters
  $scope.keyword = undefined;
  $scope.selectedCategory = undefined;
  $scope.tags = undefined;

  $scope.goto = function(route) {
    if (route) {
      localStorage.setItem('search_route', route);
      window.location.replace('index.html');
    }
  };

  $scope.changeTo = function(url) {
    window.location = url;
  }

  $scope.get_category_list = function() {
    $http.get("/categories")
    .then(function(response) {
      $scope.categories = response.data.categories;
      $scope.categories.unshift({
        _id: "",
        name: "All",
      })
      $scope.selectedCategory = $scope.categories[0]._id;
    });
  };

  $scope.get_search_route = function(advanced) {
    if (advanced) {
      $scope.minprice = $("#slider-range").slider("values", 0);
      $scope.maxprice = $("#slider-range").slider("values", 1);
    } else {
      $scope.minprice = undefined;
      $scope.maxprice = undefined;
    }
    if ($scope.keyword && $scope.keyword.trim().length > 0) {
      return ("/search" +
        "?keyword=" + encodeURIComponent($scope.keyword.trim()) +
        ($scope.minprice == undefined ? "" : ("&minprice=" + $scope.minprice)) +
        ($scope.maxprice == undefined ? "" : ($scope.maxprice == max_price ? "" : ("&maxprice=" + $scope.maxprice))) +
        ($scope.selectedCategory == "" ? "" : ("&cid=" + $scope.selectedCategory)) +
        ($scope.tags == undefined ? "" : ("&tags=" + JSON.stringify([""]))))
    } else {
      return undefined;
    }
  };

  $scope.submit_search = function(route) {
    if (!route) return;
    if ($scope.page_to_get != undefined) {
      route += "&page=" + $scope.page_to_get;
    }
    console.log(route);
    $http.get(route)
    .then(function(response) {
      if (response.data.feedback == "Success") {
        hide_recommends();  // hide recommendations on homepage
        $scope.show_search = true;

        console.log(response.data.count)
        if ($scope.page_selected == undefined) {
          $scope.page_selected = 1;
        }
        $scope.page_count = parseInt(response.data.count / 20) + (response.data.count % 20 == 0 ? 0 : 1);
        console.log("page count = " + $scope.page_count)
        if ($scope.page_count > 10) {
          $scope.page_count = 10;
        }
        $scope.page_enum = Array.apply(null, Array($scope.page_count)).map(function (_, i) {return i;});

        if (response.data.items.length == 0) {
          $scope.no_match = true;
        } else {
          $scope.no_match = false;
        }

        $scope.items = response.data.items.slice(0,20);
        $scope.items.forEach(function(item) {
          item.post_time = "Posted on " + get_formatted_time(item.open_timestamp);
          item.condition_name = get_condition[item.attributes.condition > 4 ? 4 : item.attributes.condition];
        });
      } else {
        console.log("Search error");
      }
      $timeout(set_card_height_responsive, 100);
    });
  };

  $scope.get_last_page = function() {
    if ($scope.page_selected > 1) {
      $scope.get_page($scope.page_selected - 1)
    }
  }

  $scope.get_next_page = function() {
    if ($scope.page_selected < $scope.page_count) {
      $scope.get_page($scope.page_selected + 1)
    }
  }

  $scope.get_page = function(page) {
    if (page != $scope.page_selected) {
      $scope.page_to_get = page - 1;
      $scope.submit_search($scope.get_search_route(true));
      $scope.page_selected = page;
      $('html, body').animate({
          scrollTop: $("#search-result").offset().top - 70
      }, 1000);
    }
  }

  // init call
  var nav_search_route = localStorage.getItem('search_route');
  if (nav_search_route != undefined) {
    $scope.submit_search(nav_search_route);
    $scope.keyword = nav_search_route.split("keyword=")[1].split("&")[0]
    localStorage.removeItem('search_route')
  }
  $scope.get_category_list();

};
