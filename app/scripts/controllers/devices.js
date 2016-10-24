'use strict';

/**
 * @ngdoc function
 * @name powerCloud.controller:MainCtrl
 * @description Controller device management.
 * # MainCtrl
 * Controller of powerCloud
 */

angular.module('powerCloud')
    .controller('DevicesCtrl', function($scope, $location,  $state)
    {
        $scope.$state = $state;

        var user = firebase.auth().currentUser;

        if (!user) {
            $location.path('/login');
            $scope.$apply();
        }

        $scope.meta = {"active":1};
        $scope.intervalSelected;

        $scope.intervalsAvailable = [{name:'30 Seconds',value:30},
            {name:'1 Minute',value:60},
            {name:'10 Minutes',value:600},
            {name:'30 Minutes',value:1800},
            {name:'1 Hour',value:3600}];

        $scope.addDevice = function(device)
        {
            console.log(device);
            $scope.meta = {
                "active":false,
                "appliance":device.appliance,
                "name":device.name,
                "id":device.id,
                "threshold":device.threshold,
                "interval":$scope.intervalSelected
            };

            var und = false;


            console.log($scope.meta);
            var log = [];

            angular.forEach($scope.meta, function(value, key)
            {
                if(value == undefined)
                {
                    und = true;
                }
            },log);

            if(und == false)
            {
               /* if(sharedProperties.getParticleToken() != null)
                {
                    particle.claimDevice({
                        deviceId: device.id,
                        auth: sharedProperties.getParticleToken()
                    }).then(function (data) {
                        console.log('device claim data:', data);
                    }, function (err) {
                        console.log('device claim err:', err);
                    });
                }*/
                // Get a key for a new Post.
                var newPostKey = $scope.meta.id;

                // Write the new post's data simultaneously in the posts list and the user's post list.
                var updates = {};
                updates['/meta_data/' + newPostKey] = $scope.meta;

                firebase.database().ref().update(updates).catch(function (onReject) {

                    $scope.toggleResult = false;
                    console.log(onReject);

                }).then(function (value) {

                    $scope.$apply();
                    console.log("Device Added.");
                });
            }
        }
    });
