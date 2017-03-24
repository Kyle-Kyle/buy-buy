angular.module('indexApp')
	.controller('LoginController', function($scope, $http) {
		$scope.login = function() {
			$http.post("/users/login", {
				username: $scope.credential.username,
				password: $scope.credential.password,
			})
			.then(function(response) {
				console.log(response);
				$scope.login_feedback = response.data;
				$scope.login_error = response.error_message;
			});
		}
});
console.log('load success');
