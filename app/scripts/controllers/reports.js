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
    .controller('ReportsCtrl', function($scope, $location, $state, $document, ngProgressFactory, sharedProperties, userDataService) {
        $scope.$state = $state;

        if($scope.date === undefined) {
            $scope.date = {};
            $scope.date.value = new Date();
        }

        $scope.lastUpdate = new Date();

        $scope.relayStatusText = 'Unknown';
        $scope.relayStatus = false;

        $scope.progressbar = ngProgressFactory.createInstance();
        $scope.changeNameProgress = ngProgressFactory.createInstance();


        $scope.progressbar.setColor('#ffe11c');
        $scope.progressbar.height = '3px';

        $scope.changeNameProgress.setParent(document.getElementById('changeNameDiv'));
        $scope.changeNameProgress.setColor('#ffe11c');
        $scope.changeNameProgress.height = '3px';

        var particle = new Particle();
        var device = $scope.selectedDevice;
        var device_ID = $scope.deviceID;

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
        $scope.totalCurrent = 0;

        $scope.maxEmission = 0;
        $scope.minEmission = 0;
        $scope.avgEmission = 0.0;
        $scope.totalEmission = 0;

        $scope.maxCost = 0;
        $scope.minCost = 0;
        $scope.avgCost = 0.0;
        $scope.totalCost = 0;

        $scope.maxPower = 0;
        $scope.minPower = 0;
        $scope.avgPower = 0.0;
        $scope.totalPower = 0;

        $scope.currentChartConfig = {
            options: {
                chart: {
                    type: 'areaspline',
                    zoomType: 'x',
                    panning: true,
                    panKey: 'shift',
                    events: {

                        click: function () {

                        },
                        redraw: function () {
                            var date2 = new Date($scope.date.value);
                            $scope.tempCurrentData=[];
                            var dateSelected = {};
                            dateSelected.year = date2.getFullYear();
                            dateSelected.month = date2.getMonth();
                            dateSelected.day = date2.getDate() - 1;

                            var referenceLink = "/device_data/" + device_ID + "/" + dateSelected.year + "/" + dateSelected.month + "/" + dateSelected.day;
                            var data = firebase.database().ref(referenceLink);
                            data.once('value').then(function (snapshot) {
                                snapshot.forEach(function (d) {
                                    var temp = [];

                                    temp.push(d.val().datetime * 1000);
                                    temp.push(d.val().current);
                                    $scope.tempCurrentData.push(temp);

                                });
                                $scope.chartConfig.series[0].data = $scope.tempCurrentData;
                                $scope.chartConfig.loading = false;
                                $scope.$apply();
                                $scope.chartConfig.options.chart.events.redraw();
                            })
                        }
                    }
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

        $scope.powerChartConfig = {
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
                    text: 'KWh'
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
                text: 'Power'
            },
            series: [{
                name: 'KWh',
                data: $scope.tempPowerData
            }],

            loading: true
        };
        $scope.kwhChartConfig = {
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
                text: 'Kilowatt Hours'
            },
            series: [{
                name: 'kWh',
                data: $scope.tempPowerData
            }],

            loading: true
        };

        fetchData(device_ID);
        getParticleToken();
        checkDeviceStatus();

        function calculations(Current, Power, Cost, Emission)
        {
            var log = [];

            $scope.maxCurrent = 0;
            $scope.minCurrent = 10000;
            $scope.avgCurrent = 0.0;

            angular.forEach(Current, function(value, key)
            {
                if($scope.maxCurrent < parseFloat(value[1])) {
                    $scope.maxCurrent = parseFloat(value[1]);
                }

                if($scope.minCurrent > parseFloat(value[1])) {
                    $scope.minCurrent = parseFloat(value[1]);
                }

                $scope.avgCurrent += parseFloat(value[1]);
            }, log);
            $scope.totalCurrent = $scope.avgCurrent.toFixed(2);
            $scope.avgCurrent = $scope.avgCurrent / Current.length;
            $scope.avgCurrent = $scope.avgCurrent.toFixed(2);

            $scope.maxPower = 0;
            $scope.minPower = 10000;
            $scope.avgPower = 0.0;

            angular.forEach(Power, function(value, key)
            {
                if($scope.maxPower < parseFloat(value[1]))
                {
                    $scope.maxPower = parseFloat(value[1]);
                }

                if($scope.minPower > parseFloat(value[1]))
                {
                    $scope.minPower = parseFloat(value[1]);
                }

                $scope.avgPower += parseFloat(value[1]);
            }, log);

            $scope.totalPower = $scope.avgPower.toFixed(2);
            $scope.avgPower = $scope.avgPower / Power.length;
            $scope.avgPower = $scope.avgPower.toFixed(2);

            $scope.maxEmission = 0;
            $scope.minEmission = 10000;
            $scope.avgEmission = 0.0;

            angular.forEach(Emission, function(value, key)  {
                if($scope.maxEmission < parseFloat(value)) {
                    $scope.maxEmission = parseFloat(value);
                }

                if($scope.minEmission > parseFloat(value)) {
                    $scope.minEmission = parseFloat(value);
                }

                $scope.avgEmission += parseFloat(value);
            }, log);

            $scope.totalEmission = $scope.avgEmission.toFixed(2);
            $scope.avgEmission = $scope.avgEmission / Emission.length;
            $scope.avgEmission = $scope.avgEmission.toFixed(2);

            $scope.maxCost = 0;
            $scope.minCost = 10000;
            $scope.avgCost = 0.0;

            angular.forEach(Cost, function(value, key) {
                if($scope.maxCost < parseFloat(value)) {
                    $scope.maxCost = parseFloat(value);
                }

                if($scope.minCost > parseFloat(value)) {
                    $scope.minCost = parseFloat(value);
                }

                $scope.avgCost += parseFloat(value);
            }, log);

            $scope.totalCost = $scope.avgCost.toFixed(2);
            $scope.avgCost = $scope.avgCost / Cost.length;
            $scope.avgCost = $scope.avgCost.toFixed(2);
        }

        function fetchData(id)
        {
             var dateSelected = {};
             dateSelected.year = "2016";
             dateSelected.month = "7";
             dateSelected.day = "26";
             $scope.deviceID = id;
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

                     temp2.push(d.val().datetime * 1000);
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
                 $scope.currentChartConfig.loading = false;
                 $scope.powerChartConfig.loading = false;
                 $scope.progressbar.complete();
                 $scope.kwhChartConfig.loading = false;
                 $scope.$apply();

             });

        }

        function getParticleToken() {
            var data = firebase.database().ref('/userdata/particle/access_token');

            data.once('value').then(function(snapshot) {
                sharedProperties.setParticleToken(snapshot.val());
            });
        }


        function checkDeviceStatus() {

            var authToken = sharedProperties.getParticleToken();
            if (authToken != null) {
                var varParticle = particle.getVariable({ deviceId: device_ID, name: 'relayStatus', auth: authToken });

                varParticle.then(
                    function (data) {
                        var status = false;
                        status = data.body.result;

                        if (status) {
                            $scope.relayStatusText = 'Online';
                            $scope.relayStatus = status;
                        }
                        else {
                            $scope.relayStatusText = 'Offline';
                            $scope.relayStatus = status;
                        }
                        $scope.$apply();
                        console.log("Relay Status: " + status);
                    },
                    function (err) {
                        console.log(err);
                    }
                );
            }
            else {
                console.log('Please login to Particle. Auth token null.');
            }
        }

        $scope.toggleDevice = function() {

            var authToken = sharedProperties.getParticleToken();
            var userEmail = firebase.auth().currentUser.email;
            if (authToken != null) {

                var fnPr = particle.callFunction({ deviceId: device_ID, name: 'relayToggle', argument: userEmail, auth: authToken });

                fnPr.then(
                    function (data) {
                        console.log('Function called succesfully:', data);
                        checkDeviceStatus();
                    }, function(err) {
                        console.log('An error occurred:', err);
                    });
            }
            else
            {
                console.log('Please log in to Particle. Auth token null.');
            }
        };

        $scope.changeNameSuccess = false;
        $scope.changeNameFailure = false;

        $scope.changeDeviceName = function(id) {
            $scope.changeNameProgress.start();

            var refLink = 'meta_data/' + id + '/';
            var newName = $scope.deviceNewName;

            firebase.database().ref(refLink).update({
                name: newName
            }).catch(function(onReject) {

                $scope.changeNameSuccess = false;
                $scope.changeNameFailure = true;

                console.log(onReject);

            }).then(function(value) {

                $scope.changeNameSuccess = true;
                $scope.changeNameFailure = false;
                $scope.changeNameProgress.complete();

            });
        };
    });
