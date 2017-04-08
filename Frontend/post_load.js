
angular.module('postApp')
  .controller('postController', function($scope){
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
      var pattern = /^[0-9]*$/;
      if($scope.quantity == undefined || !$scope.quantity.match(pattern))
          {
            $scope.quantityValid = false;
            $scope.quantityErrorMsg = 'Positive interger quantity is required';
          }

      else{
          $scope.quantityValid = true;
      }
}

});
