//The main controller, it'll control fetching data, binding scope variables and defining the scope of the application.
'use strict';

/**
 * @ngdoc function
 * @name yapp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of yapp
 */
angular.module('yapp')
    .controller('DashboardCtrl', function($scope, $state) {

        $scope.$state = $state;

    });
