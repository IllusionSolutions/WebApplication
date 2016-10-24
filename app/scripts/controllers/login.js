'use strict';

/**
 * @ngdoc function
 * @name powerCloud.controller:LoginCtrl
 * @description Controls login process, Firebase interaction goes here, sets Environment variables.
 * # LoginCtrl
 * Controller for the login page.
 */
angular.module('powerCloud')
    .controller('LoginCtrl', function($scope, $location, userDataService) {

        $scope.submit = function() {

            $scope.errorVal = false;

            var email = $scope.user.email;
            var pass = $scope.user.password;

            firebase.auth().signInWithEmailAndPassword(email, pass)
                .then(function(result)
                {
                    userDataService.setUserData(result);
                    $location.path('/dashboard');
                    $scope.$apply();
                })
                .catch(function(error)
                {
                    $scope.errorVal = true;
                    $scope.errorMessage = error.message;

                    console.log(error.message);
                    $scope.$apply();
                });
        };

    });
