angular.module('indexApp')
	.controller('loginController', function($scope, $http) {
		$scope.login = function(){$http.post("/users/login")
			.then(function(response) {
				$scope.login_feedback = response.data;
				$scope.login_error = response.error_message;
			});
		}
});
console.log('load success');
