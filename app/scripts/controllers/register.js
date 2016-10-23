'use strict';

/**
 * @ngdoc function
 * @name powerCloud.controller:MainCtrl
 * @description Controls registration process, Firebase interaction goes here.
 * # MainCtrl
 * Controller of powerCloud
 */

angular.module('powerCloud')
    .controller('RegisterCtrl', function($scope, $location) {

        $scope.user = {};

        $scope.goToLogin = function() {
            $location.path('/login');
            $scope.$apply();
        };
        $scope.submit = function(u) {

            var e = $scope.user.email;
            var p = $scope.user.pass;
            firebase.auth().createUserWithEmailAndPassword(e, p).then(function (result) {
                $location.path('/dashboard');
                $scope.$apply();
            }, function (error) {
                alert("The email does not exist or is already registered"+error.message, 'long', 'center');
                $scope.$apply();
            });
            $scope.$apply();
            return false;
        }

    });
