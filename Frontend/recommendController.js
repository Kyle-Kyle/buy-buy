var recommendController = function($scope, $http) {
  var range = function(len) {
    return Array.apply(null, Array(len)).map(function (_, i) {return i;});
  }
  $scope.get_condition = ["Like New", "Very Good", "Good", "Acceptable", "Bad"]
  $scope.get_recommendations = function() {
    $http.get("/recommends")
    .then(function(response) {
      console.log(response)
      $scope.items = response.data.items;
      $scope.items.forEach(function(item) {
        //console.log($scope.$parent.get_formatted_time(item.open_timestamp))
        item.post_time = "Posted on " + $scope.$parent.get_formatted_time(item.open_timestamp);
      });
      var rowNum = Math.floor($scope.items.length / 3);
      $scope.rows = range(rowNum);
      console.log($scope.items)
    });
  };
}
