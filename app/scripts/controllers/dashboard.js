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
    .controller('DashboardCtrl', function($scope, $state, sharedProperties) {
        $scope.$state = $state;

        $scope.allDevices = null;

        var particle = new Particle();

        testAccessToken();
        fetchDevices();

        $scope.viewDevice = function(deviceID, deviceSelected) {
            $scope.deviceID = deviceID;
            $scope.selectedDevice = deviceSelected;
        };

        $scope.launchSettings = function(device){
            $scope.settingsDevice = device;
        };

        $scope.logout = function() {
            firebase.auth().signOut().then(function() {
                // Sign-out successful.
                alert("Successfully signed out.");
            }, function(error) {
                // An error happened.
                alert("Could not sign out.\n" + error.message);
            });
        };

        $scope.viewDeviceInfo = function (deviceID) {
            var particleToken = sharedProperties.getParticleToken();

            $scope.deviceAttr = null;

            var devicesPr = particle.getDevice({ deviceId: deviceID, auth: particleToken });
            devicesPr.then (
                function(data) {
                    $scope.deviceAttr = data.body;
                    var lastDate = new Date(data.body.last_heard);
                    $scope.deviceAttr.date = lastDate.toDateString() + ' at ' + lastDate.toLocaleTimeString();

                    console.log('Device attrs retrieved successfully:', $scope.deviceAttr);
                    $scope.$apply();
                },
                function(err) {
                    //console.log('API call failed: ', err);
                }
            );
        };

        function fetchDevices() {
            var referenceLink = "/meta_data";
            var data = firebase.database().ref(referenceLink);

            data.once('value').then(function(snapshot) {
                $scope.allDevices = [];
                snapshot.forEach(function(d) {
                    $scope.allDevices.push(d.val());
                });
                $scope.$apply();
            });
        }

        function testAccessToken() {
            if (sharedProperties.getParticleToken() == null) {
                var refLink = '/userdata/particle/access_token';
                var data = firebase.database().ref(refLink);

                data.once('value').then(function(snapshot) {

                    var token = snapshot.val();
                    var devicesPr = particle.listDevices({ auth: token });

                    devicesPr.then (
                        function(devices) {
                            sharedProperties.setParticleToken(token);
                            //console.log('Devices: ', devices);
                        },
                        function(err) {
                            //console.log('List devices call failed: ', err);
                        }
                    );
                });
            }
        }
    });
