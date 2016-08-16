//Controls login process, Firebase interaction goes here, sets Environment variables.
'use strict';

/**
 * @ngdoc function
 * @name yapp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of yapp
 */
angular.module('yapp')
    .controller('LoginCtrl', function($scope, $location) {

        $scope.submit = function() {

            $location.path('/dashboard');

            return false;
        }

    });
