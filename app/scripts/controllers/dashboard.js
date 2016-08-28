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
    .controller('DashboardCtrl', function($scope, $state, ngProgressFactory) {
        $scope.$state = $state;

        $scope.progressbar = ngProgressFactory.createInstance();
        $scope.progressbar.setColor('#ffe11c');
        $scope.progressbar.height = '3px';

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
            $scope.progressbar.start();
            var data = firebase.database().ref(referenceLink);

            data.once('value').then(function(snapshot) {
                snapshot.forEach(function(d) {
                    $scope.allDevices.push(d.val());
                });
                $scope.progressbar.complete();
                $scope.$apply();
            });
        }

    });
