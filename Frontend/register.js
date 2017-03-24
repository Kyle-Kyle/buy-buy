angular.module('indexApp')
.controller('regController', function($scope, $http) {

  // POST register request to server
  $scope.register = function() {

  }

  $scope.validateUsername = function(dirty) {
    var pattern = /^[_A-Za-z0-9]{3,20}$/;
    if ($scope.username != undefined && $scope.username.match(pattern)) {
      //TODO: send request to server check if the name has been taken
      if ($scope.nameTaken == true) {
        $scope.unValid = false;
        $scope.unErrorMsg = 'The name has already been taken';
      } else {
        $scope.unValid = true;  // valid username, show ok feedback
      }
    } else {
      $scope.unValid = false;
      if ($scope.username == undefined) {
        $scope.unErrorMsg = 'Username is required';
      }
      else if ($scope.username.length < 3) {
        $scope.unErrorMsg = 'No less than 3 characters';
      } else {
        $scope.unErrorMsg = 'Only alphabets, digits and underscores are allowed'
      }
    }
  };

  $scope.validatePassword = function(confirm_dirty) {
    var pattern = /^[^\s]{8,20}$/;
    if ($scope.password != undefined && $scope.password.match(pattern)) {
      $scope.pwValid = true;  // toggle feedback
    } else {
      $scope.pwValid = false; // toggle feedback
      if ($scope.password == undefined) {
        $scope.pwErrorMsg = 'Password is required';
      }
      else if ($scope.password.length < 8) {
        $scope.pwErrorMsg = 'No less than 8 characters';
      } else {
        $scope.pwErrorMsg = 'Spaces, tabs and other blank characters is not allowed'
      }
    }

    // immediate check in case of original password editting
    if (confirm_dirty == true) {
      $scope.confirmPassword();
    }
  };

  $scope.confirmPassword = function() {
    var pw = $('#reg-pw');  // password input
    var pwcf = $('#pw-confirm');  // confirmation input

    // first check if the password is valid
    if ($scope.pwValid) {
      if (pw && pwcf && pw[0].value == pwcf[0].value) {
        $scope.pwMatch = true;  // toggle feedback
        $scope.regForm.passwordConfirm.$invalid = false;
      } else {
        $scope.pwMatch = false; // toggle feedback
        $scope.regForm.passwordConfirm.$invalid = true;
      }
    } else {
      $scope.pwMatch = false; // toggle feedback
      $scope.regForm.passwordConfirm.$invalid = true;
    }
  };

})
.directive('compareTo', function() {
  return {
    require: 'ngModel',   // requires the controller of this ngModel
    scope: {
      otherModelValue: '=compareTo'
    },
    link: function(scope, element, attributes, ctrl) {

      ctrl.$validators.compareTo = function(modelValue) {
        //console.log(scope.otherModelValue);
        //console.log(modelValue);
        if (modelValue == undefined) {
          ctrl.$setValidity('match', false);
        } else {
          ctrl.$setValidity('match', modelValue == scope.otherModelValue.$modelValue);
        }
      };

      scope.$watch("otherModelValue", function() {
        ctrl.$validate();
      });
    }
  };
})
