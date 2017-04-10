var recommendController = function($scope, $http) {
  var range = function(len) {
    return Array.apply(null, Array(len)).map(function (_, i) {return i;});
  }

  $scope.get_recommendations = function() {
    $http.get("/recommends")
    .then(function(response) {
      $scope.items = response.data;
      var rowNum = Math.floor($scope.items.length / 3);
      $scope.rows = range(rowNum);
      console.log($scope.items)
    });
  };
}
