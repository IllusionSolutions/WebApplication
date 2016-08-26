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
                var errorCode = error.code;
                var errorMessage = error.message;
                    alert(errorCode + " " + errorMessage);
                });

            return false;
        }

    });
