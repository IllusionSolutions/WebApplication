//This controller controls the events of the profile page.
'use strict';

/**
 * @ngdoc function
 * @name powerCloud.controller:profileCtrl
 * @description
 * # profileCtrl
 * Controller of powerCloud
 */


angular.module('powerCloud')
    .controller('ProfileCtrl', function($scope, $state, $document, ngProgressFactory, sharedProperties) {
        $scope.$state = $state;

        $scope.progressbar = ngProgressFactory.createInstance();
        $scope.progressbar.setColor('#ffe11c');
        $scope.progressbar.height = '3px';

        $scope.particleLoginFailure = false;
        $scope.particleLoginSuccess = false;

        var particle = new Particle();

        $scope.loginParticle = function() {

            $scope.progressbar.start();
            var emailAddress = $scope.particleEmail;
            var password = $scope.partclePassword;

            particle.login({username: $scope.particleEmail, password: $scope.particlePass})
                .then(
                function(data)
                {
                    $scope.progressbar.complete();
                    $scope.particleLoginSuccess = true;
                    sharedProperties.setParticleToken(data.body.access_token);

                    console.log('API call completed on promise resolve: ', data.body.access_token);
                    saveAccessToken(data.body.access_token);
                },

                function(err) {
                    $scope.progressbar.complete();
                    $scope.particleLoginFailure = true;
                    $scope.particleError = err;

                    console.log('API call completed on promise fail: ', err);
                }
            );
        };

        function saveAccessToken(token) {

            var refLink = 'userdata/particle/';

            firebase.database().ref(refLink).update({
                access_token: token
            }).catch(function(onReject) {

                console.log(onReject);

            }).then(function(value) {

                console.log(value);
            });
        };


    });
