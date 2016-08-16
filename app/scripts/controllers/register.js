//Controls registration process, Firebase interaction goes here.
'use strict';

/**
 * @ngdoc function
 * @name yapp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of yapp
 */

angular.module('yapp')
    .controller('RegisterCtrl', function($scope, $location) {

        $scope.user = {};
        $scope.dirLogin = function() {
            $location.path('/login');
        };
        $scope.submit = function(u) {
            //alert($scope.user.email);
            //alert($scope.user.pass);
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
