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
        $scope.allDevices = [];
        fetchDevices();
        $scope.selectedDevice =  $scope.allDevices[1];


        $scope.viewDevice = function(key, deviceSelected) {
            $scope.selectedDevice = deviceSelected;
        };

        function fetchDevices()
        {
            console.log("Fetching devices...");
            var referenceLink = "/";
            var data = firebase.database().ref(referenceLink);

            data.once('value').then(function(snapshot) {
                    snapshot.forEach(function(d) {
                        $scope.allDevices.push(d.val());
                });
                console.log($scope.allDevices);
                $scope.$apply();
            });
        }
    });
