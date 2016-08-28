//The main controller, it'll control fetching data, binding scope variables and defining the scope of the application.
'use strict';

/**
 * @ngdoc function
 * @name powerCloud.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of powerCloud
 */

angular.module('powerCloud')
    .controller('DashboardCtrl', function($scope, $state) {
        $scope.$state = $state;

        $scope.allDevices = [];
        fetchDevices();


        $scope.viewDevice = function(deviceID, deviceSelected) {
            $scope.deviceID = deviceID;
            $scope.selectedDevice = deviceSelected;
        };

        $scope.logout = function()
        {
            firebase.auth().signOut().then(function() {
                // Sign-out successful.
                alert("Successfully signed out.");
            }, function(error) {
                // An error happened.
                alert("Could not sign out.\n" + error.message);
            });
        };

        function fetchDevices()
        {
            var referenceLink = "/meta_data";
            var data = firebase.database().ref(referenceLink);

            data.once('value').then(function(snapshot) {
                snapshot.forEach(function(d) {
                    $scope.allDevices.push(d.val());
                });
                $scope.$apply();
            });
        }

    });
