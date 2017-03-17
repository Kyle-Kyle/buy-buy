(function () {
    'use strict';

    angular
        .module('app')
        .controller('LoginController', LoginController);

    function LoginController() {
        var vm = this;
        vm.login = login;

        function login() {
          $http.post("/users/login", {username: vm.username, password: vm.password})
          .then(function(response) {
              $scope.login_feedback = response.data;
              $scope.login_error = response.error_message;
          });
        };
    }

})();
