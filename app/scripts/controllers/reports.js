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

        var i;

        $scope.voltage = 0.0;

        $scope.tempCurrentData = [];
        $scope.tempPowerData = [];
        $scope.tempCostData = [];
        $scope.tempEmissionData = [];
        $scope.tempCategories = [];

        $scope.maxCurrent = 0;
        $scope.minCurrent = 0;
        $scope.avgCurrent = 0.0;

        $scope.maxEmission = 0;
        $scope.minEmission = 0;
        $scope.avgEmission = 0.0;

        $scope.maxCost = 0;
        $scope.minCost = 0;
        $scope.avgCost = 0.0;

        $scope.maxPower = 0;
        $scope.minPower = 0;
        $scope.avgPower = 0.0;

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


        function calculations(Current, Power, Cost, Emission)
        {
            var log = [];

            $scope.maxCurrent = 0;
            $scope.minCurrent = 10000;
            $scope.avgCurrent = 0.0;

            angular.forEach(Current, function(value, key)
            {
                if($scope.maxCurrent < parseFloat(value[1]))
                {
                    $scope.maxCurrent = parseFloat(value[1]);
                }

                if($scope.minCurrent > parseFloat(value[1]))
                {
                    $scope.minCurrent = parseFloat(value[1]);
                }

                $scope.avgCurrent += parseFloat(value[1]);
            }, log);
            $scope.avgCurrent = $scope.avgCurrent / Current.length;
            $scope.avgCurrent = $scope.avgCurrent.toFixed(2);

            $scope.maxPower = 0;
            $scope.minPower = 10000;
            $scope.avgPower = 0.0;

            angular.forEach(Power, function(value, key)
            {
                if($scope.maxPower < parseFloat(value))
                {
                    $scope.maxPower = parseFloat(value);
                }

                if($scope.minPower > parseFloat(value))
                {
                    $scope.minPower = parseFloat(value);
                }

                $scope.avgPower += parseFloat(value);
            }, log);
            $scope.avgPower = $scope.avgPower / Power.length;
            $scope.avgPower = $scope.avgPower.toFixed(2);

            $scope.maxEmission = 0;
            $scope.minEmission = 10000;
            $scope.avgEmission = 0.0;

            angular.forEach(Emission, function(value, key)
            {
                if($scope.maxEmission < parseFloat(value))
                {
                    $scope.maxEmission = parseFloat(value);
                }

                if($scope.minEmission > parseFloat(value))
                {
                    $scope.minEmission = parseFloat(value);
                }

                $scope.avgEmission += parseFloat(value);
            }, log);
            $scope.avgEmission = $scope.avgEmission / Emission.length;
            $scope.avgEmission = $scope.avgEmission.toFixed(2);

            $scope.maxCost = 0;
            $scope.minCost = 10000;
            $scope.avgCost = 0.0;

            angular.forEach(Cost, function(value, key)
            {
                if($scope.maxCost < parseFloat(value))
                {
                    $scope.maxCost = parseFloat(value);
                }

                if($scope.minCost > parseFloat(value))
                {
                    $scope.minCost = parseFloat(value);
                }

                $scope.avgCost += parseFloat(value);
            }, log);
            $scope.avgCost = $scope.avgCost / Cost.length;
            $scope.avgCost = $scope.avgCost.toFixed(2);
        }

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
                     var temp1 = [];
                     var temp2 = [];
                     var temp3 = [];
                     var temp4 = [];

                     temp1.push(d.val().datetime * 1000);
                     temp1.push(d.val().current);

                     temp2.push(d.val().power);

                     temp3.push(d.val().calculations.cost);

                     temp4.push(d.val().calculations.emission);

                     $scope.voltage = d.val().voltage;


                     $scope.tempCurrentData.push(temp1);
                     $scope.tempPowerData.push(temp2);
                     $scope.tempCostData.push(temp3);
                     $scope.tempEmissionData.push(temp4);
                 });

                 calculations($scope.tempCurrentData,$scope.tempPowerData,$scope.tempCostData,$scope.tempEmissionData);
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
