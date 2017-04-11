var recommendController = function($scope, $http) {

  $scope.is_recommend = true;

  $scope.get_recommendations = function() {
    $http.get("/recommends")
    .then(function(response) {
      console.log(response)
      $scope.items = response.data.items;
      $scope.items.forEach(function(item) {
        //console.log($scope.$parent.get_formatted_time(item.open_timestamp))
        item.post_time = "Posted on " + get_formatted_time(item.open_timestamp);
        item.condition_name = get_condition[item.attributes.condition-1];
      });
    });
  };
}
