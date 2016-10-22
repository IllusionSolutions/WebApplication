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

        $scope.firebaseUser = firebase.auth().currentUser;

        var updateDataFlag = -1; // -1 No update, 0 Update Email, 1 Update Password

        $scope.changeEmail ='';
        $scope.newPassChange = '';
        $scope.newPassRepeatChange = '';
        $scope.authenticated = false;

        $scope.particleLoginFailure = false;
        $scope.particleLoginSuccess = false;

        $scope.tokenTestResult = null;
        $scope.tokenText = 'Unknown';

        $scope.tokenExists = false;

        var particle = new Particle();
        testAccessToken();

        $scope.loginParticle = function() {

            $scope.progressbar.start();
            var emailAddress = $scope.particleEmail;
            var password = $scope.partclePassword;

            particle.login({username: $scope.particleEmail, password: $scope.particlePass})
                .then(
                function(data) {
                    $scope.progressbar.complete();
                    $scope.particleLoginSuccess = true;
                    sharedProperties.setParticleToken(data.body.access_token);

                    //console.log('API call completed on promise resolve: ', data.body.access_token);
                    saveAccessToken(data.body.access_token);
                },

                function(err) {

                    $scope.progressbar.complete();
                    $scope.particleLoginFailure = true;
                    $scope.particleError = err;

                    //console.log('API call completed on promise fail: ', err);
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
        }

        function testAccessToken() {

            //Check if token exists
            var token = null;
            if (sharedProperties.getParticleToken() == null) {
                var refLink = '/userdata/particle/access_token';
                var data = firebase.database().ref(refLink);

                data.once('value').then(function(snapshot) {
                    token = snapshot.val();
                });
            } else {
                token = sharedProperties.getParticleToken();
            }

            //Test if the token still works
            if (token != null) {
                var devicesPr = particle.listDevices({ auth: token });

                devicesPr.then (
                    function(devices) {
                        $scope.tokenExists = true;
                        $scope.tokenTestResult = true;
                        $scope.tokenText = 'Access Granted';
                        sharedProperties.setParticleToken(token);
                        $scope.$apply();
                        //console.log('Devices: ', devices);
                    },
                    function(err) {
                        $scope.tokenExists = true;
                        $scope.tokenTestResult = false;
                        $scope.tokenText = 'Access Denied';
                        $scope.$apply();
                        //console.log('List devices call failed: ', err);
                    }
                );
            }
            else {
                $scope.tokenExists = false;
            }
        }

        $scope.removeToken = function () {
            var refLink = 'userdata/particle/access_token';

            firebase.database().ref(refLink)
                .remove()
                .then(function(value) {
                    $scope.tokenTestResult = false;
                    $scope.tokenText = 'No Token Found';
                    $scope.$apply();
                    //console.log(value);
                });
        };

        $scope.re_authenticate = function() {

            var email = $scope.user.email;
            var pass = $scope.user.password;

            var user = firebase.auth().currentUser;
            var credentials = firebase.auth.EmailAuthProvider.credential( email, pass );

            user.reauthenticate(credentials).then(function() {
                $scope.authenticated = true;

                if (updateDataFlag == 0) {
                    changeEmailAddress();
                }
                else if (updateDataFlag = 1) {
                    changePassword();
                }

            }, function(error) {
                $scope.authenticated = false;
            });
        };

        $scope.updateType = function(type) {
            updateDataFlag = type;
        };

        function changeEmailAddress() {
            var user = firebase.auth().currentUser;
            var newEmail = $scope.changeEmail;

            if(user.email != newEmail) {
                user.updateEmail(newEmail).then(function() {
                    console.log("Email update success");
                }, function(error) {
                    console.log(error);
                });
            }
        }

        function changePassword() {
            if ($scope.newPassChange == $scope.newPassRepeatChange) {
                var user = firebase.auth().currentUser;
                var newPassword = $scope.newPassRepeatChange;

                user.updatePassword(newPassword).then(function() {
                    console.log("Password update success");
                }, function(error) {
                    console.log(error);
                });
            }
        }
    });
