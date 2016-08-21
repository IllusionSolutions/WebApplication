//Controller to display & interact with device data.
'use strict';

/**
 * @ngdoc function
 * @name yapp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of yapp
 */
angular.module('yapp')
    .controller('ReportsCtrl', function($scope, $state) {
        $scope.$state = $state;

        var device = $scope.selectedDevice;
        var deviceKey = $scope.deviceKey;

        $scope.tempCurrentData = [];
        $scope.tempCategories = [];

        $scope.chartConfig = {
            options: {
                chart: {
                    type: 'areaspline'
                }
            },
            yAxis: {
                title: {
                    text: 'amps'
                }
            },
            xAxis: {
                type: 'datetime',
                //categories: $scope.tempCategories,
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

            loading: false
        };

        fetchData(deviceKey);

        function fetchData(deviceID)
        {

             var dateSelected = {};
             dateSelected.year = "2016";
             dateSelected.month = "7";
             dateSelected.day = "18";
             var deviceSelected = deviceID + 1;

             var referenceLink = deviceSelected +"/data/"+ dateSelected.year + "/" + dateSelected.month + "/" + dateSelected.day;
             var data = firebase.database().ref(referenceLink);

             data.once('value').then(function(snapshot)
             {
                 snapshot.forEach(function(d) {
                     var temp = [];

                     temp.push(d.val().datetime * 1000);
                     temp.push(d.val().current);

                     $scope.tempCurrentData.push(temp);
                 });

                 $scope.$apply();
             });

        }

    });
