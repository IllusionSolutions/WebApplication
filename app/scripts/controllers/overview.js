//Controls login process, Firebase interaction goes here, sets Environment variables.
'use strict';

/**
 * @ngdoc function
 * @name powerCloud.controller:OverviewCtrl
 * @description
 * # OverviewCtrl
 * Controller of the overview page.
 */
angular.module('powerCloud')
    .controller('OverviewCtrl', function($scope, $state, ngProgressFactory) {
        $scope.$state = $state;

        $scope.progressbar = ngProgressFactory.createInstance();
        $scope.progressbar.setColor('#ffe11c');
        $scope.progressbar.height = '3px';

        $scope.allCurrentData = [];
        $scope.allPowerData = [];

        $scope.overviewCurrentConfig = {
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
                text: 'Overall Current'
            },
            series: [{
                name: 'Amps',
                data: $scope.allCurrentData
            }],

            loading: true
        };

        $scope.overviewPowerConfig = {
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
                    text: 'kWh'
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
                text: 'Overall kWh'
            },
            series: [{
                name: 'kWh',
                data: $scope.allPowerData
            }],

            loading: true
        };

        var referenceLink = "/statistics";
        var data = firebase.database().ref(referenceLink);
        var dataSnapshot;

        data.once('value').then(function(snapshot) {
            dataSnapshot = snapshot;
        });

        if (dataSnapshot == null)
        {
            $scope.progressbar.start();
            fetchAllData();
            populateCurrentPie();
        }
        else
        {
        }

        function fetchAllData()
        {
            var referenceLink = "device_data/";
            var data = firebase.database().ref(referenceLink);
            var dataSnapshot;

            data.once('value').then(function(snapshot) {
                snapshot.forEach(function(d)
                {
                    var temp;
                    temp = d.child("2016/7/24");

                    temp.forEach(function(stuff)
                    {
                        var curr = [];
                        var pow = [];
                        var vol = [];

                        curr.push(stuff.val().datetime * 1000);
                        curr.push(stuff.val().current);

                        pow.push(stuff.val().datetime * 1000);
                        pow.push(stuff.val().power);


                        $scope.allCurrentData.push(curr);
                        $scope.allPowerData.push(pow);
                    });
                });

                $scope.overviewCurrentConfig.loading = false;
                $scope.overviewPowerConfig.loading = false;
                $scope.progressbar.complete();
                $scope.$apply();
            });

        }

        function populateCurrentPie()
        {

        }
    });
