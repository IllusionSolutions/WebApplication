'use strict';

/**
 * @ngdoc function
 * @name powerCloud.controller:MainCtrl
 * @description Controller device management.
 * # MainCtrl
 * Controller of powerCloud
 */

angular.module('powerCloud')
    .controller('DevicesCtrl', function($scope,  $state)
    {
        $scope.$state = $state;
        $scope.meta = {"active":1};

        $scope.addDevice = function(device)
        {
            console.log(device);
            $scope.meta = {
                "active":false,
                "appliance":device.appliance,
                "name":device.name,
                "id":device.id,
                "threshold":device.threshold,
                "interval":device.interval
            };

            var und = false;

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
                particle.claimDevice({ deviceId: device.id, auth: sharedProperties.getParticleToken() }).then(function(data)
                {
                    console.log('device claim data:', data);
                }, function(err)
                {
                    console.log('device claim err:', err);
                });
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
