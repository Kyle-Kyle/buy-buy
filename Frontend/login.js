angular.module('indexApp')
.controller('LoginController', function($scope, $http, $timeout) {
	$scope.login = function() {
		// show loading UI
		$scope.login_btn_style = 'btn-primary m-progress';

		// send login request to server
		$http.post("/users/login", {
			username: $scope.credential.username,
			password: $scope.credential.password,
		})
		.then(function(response) {
			$scope.login_response = response;

			// 500ms timeout for animation display
			$timeout(function() {
				// parse data from server response
				$scope.login_feedback = $scope.login_response.data.feedback;
				$scope.login_err_msg = $scope.login_response.data.err_msg;

				if ($scope.login_feedback == 'Success') {
					$scope.loginFailed = false;

					// change button style, show successful feedback
					$scope.login_btn_style = 'btn-success';
					$scope.login_btn_text = 'Success';

					// update frontend user status and corresponding UI
					$timeout(function() {
						$('#login-modal').modal('toggle');
						$scope.$parent.sign_in($scope.credential.username);	// method of mainController
					}, 1000);	// delay 1s for feedback's display

				} else if ($scope.login_feedback == 'Failure') {
					$scope.loginFailed = true;
					$scope.login_btn_style = 'btn-primary';	// reset btn style
				} else {
					console.log('Error: invalid login feedback');
					$scope.login_btn_style = 'btn-primary';	// reset btn style
				}
			}, 500);
		});
	}
});
