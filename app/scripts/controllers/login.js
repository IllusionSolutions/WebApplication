//Controls login process, Firebase interaction goes here, sets Environment variables.
'use strict';

/**
 * @ngdoc function
 * @name powerCloud.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Controller for the login page.
 */
angular.module('powerCloud')
    .controller('LoginCtrl', function($scope, $location) {

        $scope.submit = function() {

            $scope.errorVal = false;

            var email = $scope.user.email;
            var pass = $scope.user.password;

            firebase.auth().signInWithEmailAndPassword(email, pass)
                .then(function(result)
                {
                    $location.path('/dashboard');
                    $scope.$apply();
                })
                .catch(function(error)
                {
                    $scope.errorVal = true;
                    $scope.errorCode = 100;
                    $scope.errorMessage = "Incorrect login credentials.";

                    console.log(error.message);
                    $scope.$apply();
                });
        }

    });
