//Controller to display & interact with device data.
'use strict';

/**
 * @ngdoc function
 * @name powerCloud.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of powerCloud
 */
angular.module('powerCloud')
    .controller('ReportsCtrl', function($scope, $state, ngProgressFactory, sharedProperties) {
        $scope.$state = $state;

        $scope.progressbar = ngProgressFactory.createInstance();
        $scope.progressbar.setColor('#ffe11c');
        $scope.progressbar.height = '3px';

        var particle = new Particle();
        var device = $scope.selectedDevice;
        var device_ID = $scope.deviceID;
        console.log(device_ID);
        console.log(sharedProperties.getParticleToken());

        $scope.tempCurrentData = [];
        $scope.tempCategories = [];

        $scope.chartConfig = {
            options: {
                chart: {
                    type: 'areaspline',
                    zoomType: 'x',
                    panning: true,
                    panKey: 'shift'
                }
            },
            yAxis: {
                title: {
                    text: 'amps'
                }
            },
            xAxis: {
                type: 'datetime',
                gridLineWidth: 1,
                title: {
                    text: 'Time'
                }
            },
            tooltip: {
                crosshairs: true
            },
            title: {
                text: 'Current'
            },
            series: [{
                name: 'Amps',
                data: $scope.tempCurrentData
            }],

            loading: true
        };
        fetchData(device_ID);

        function fetchData(id)
        {
             var dateSelected = {};
             dateSelected.year = "2016";
             dateSelected.month = "7";
             dateSelected.day = "27";
             var deviceSelected = id;
             $scope.progressbar.start();
             var referenceLink = "/device_data/"+ deviceSelected +"/"+ dateSelected.year + "/" + dateSelected.month + "/" + dateSelected.day;
             var data = firebase.database().ref(referenceLink);

             data.once('value').then(function(snapshot)
             {
                 snapshot.forEach(function(d) {
                     var temp = [];
                     temp.push(d.val().datetime * 1000);
                     temp.push(d.val().current);
                     $scope.tempCurrentData.push(temp);
                 });

                 $scope.chartConfig.loading = false;
                 $scope.progressbar.complete();
                 $scope.$apply();
             });

        }

        $scope.toggleDevice = function()
        {
            var authToken = sharedProperties.getParticleToken();
            if (authToken != null)
            {
                var fnPr = particle.callFunction({ deviceId: device_ID, name: 'relayToggle', argument: 'RandomShit', auth: authToken });

                fnPr.then(
                    function(data) {
                        console.log('Function called succesfully:', data);
                    }, function(err) {
                        console.log('An error occurred:', err);
                    });
            }
            else
            {
                console.log('Please log in to Particle. Auth token null');
            }
        }

    });
