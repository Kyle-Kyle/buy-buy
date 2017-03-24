angular.module('indexApp')
	.controller('LoginController', function($scope, $http, $timeout) {
		$scope.login = function() {
			$scope.login_btn_style = 'btn-primary m-progress';
			$http.post("/users/login", {
				username: $scope.credential.username,
				password: $scope.credential.password,
			})
			.then(function(response) {
				$scope.login_response= response;
					$timeout(function() {
						$scope.login_feedback = $scope.login_response.data.feedback;
						$scope.login_err_msg = $scope.login_response.data.err_msg;
						//TODO: get session-id and set cookies


						if ($scope.login_feedback == 'Success') {

							$scope.loginFailed = false;

							console.log('Login success!');
							$scope.login_btn_style = 'btn-success';
							$scope.login_btn_text = 'Success';
							$timeout(function() {
								$('#login-modal').modal('toggle');
								//TODO: update navs
								$scope.$parent.sign_in();
							}, 1000);


						} else if ($scope.login_feedback == 'Failure') {
							$scope.loginFailed = true;
							$scope.login_btn_style = 'btn-primary';
						} else {
							console.log('Error: invalid login feedback');
							$scope.login_btn_style = 'btn-primary';
						}
					}, 500);
			});
		}
});
console.log('load success');
