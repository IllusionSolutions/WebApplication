//Controller device management.
'use strict';

/**
 * @ngdoc function
 * @name powerCloud.controller:MainCtrl
 * @description
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
                "active":1,
                "appliance":device.appliance,
                "name":device.name,
                "id":device.id,
                "threshold":device.threshold
            };

            // Get a key for a new Post.
            var newPostKey = $scope.meta.id;

            // Write the new post's data simultaneously in the posts list and the user's post list.
            var updates = {};
            updates['/meta_data/' + newPostKey] = $scope.meta;

            return firebase.database().ref().update(updates);
        }
    });
