angular.module('indexApp')
.controller('regController', function($scope, $http) {

  // POST register request to server
  $scope.register = function() {
    $http.post("/users/register", {
      // requried
      username: $scope.username,
      password: $scope.password,
      email: $scope.email,
      // not required (undefined if there is no input)
      tel: $scope.tel,
      description: $scope.description,
    })
    .then(function(response) {
      // TODO: finish callback
      console.log(response);

      $scope.reg_msg = 'A confirmation email has sent to ' + $scope.email +
        '. Please confirm the email to finish your registration.'
    });
  };


  $scope.validateUsername = function(dirty) {
    var pattern = /^[_A-Za-z0-9]{3,20}$/;
    if ($scope.username != undefined && $scope.username.match(pattern)) {
      // send request to server to check if the name has been taken
      $http.post("/users/validate", {
        username: $scope.username,
      })
      .then(function(response) {
        $scope.nameTaken = (response.data.msg == 'taken');
        if ($scope.nameTaken == true) {
          $scope.unValid = false;
          $scope.unErrorMsg = 'The name has already been taken';
        } else {
          $scope.unValid = true;  // valid username, show ok feedback
        }
      });
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

  $scope.validateEmail = function() {
    var pattern = /^1155\d{6}@link\.cuhk\.edu.\hk$/;
    if ($scope.email != undefined && $scope.email.match(pattern)) {
      $http.post("/users/validate", {
        email: $scope.email,
      })
      .then(function(response) {
        $scope.emailTaken = (response.data.msg == 'taken');
        if ($scope.emailTaken == true) {
          $scope.regForm.email.$setValidity('email', false);
          $scope.emErrorMsg = 'The email has already been used';
        } else {
          $scope.regForm.email.$setValidity('email', true);  // valid email, show ok feedback
        }
      })
    } else {
      $scope.regForm.email.$setValidity('email', false);
      $scope.emErrorMsg = 'Not a valid email address';
    }
  }

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
