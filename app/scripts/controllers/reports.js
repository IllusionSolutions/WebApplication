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
    .controller('ReportsCtrl', function($scope, $state, $document, ngProgressFactory, sharedProperties) {
        $scope.$state = $state;

        var currentG = false;
        var realT = false;
        var kwG = false;
        $scope.setOverview = function()
        {
            currentG = false;
            realT = false;
            kwG = false;
            console.log("current: " + currentG + "real: " + realT);
        }

        $scope.setKw = function()
        {
            currentG = false;
            realT = false;
            kwG = true;
            setTimeout($scope.powerChartConfig.options.chart.events.redraw(), 5000);
            console.log("current: " + currentG + "real: " + realT);
        }



        $scope.setCurrent = function()
        {
            currentG = true;
            realT = false;
            kwG = false;
            console.log("current: " + currentG + "real: " + realT);
            setTimeout($scope.currentChartConfig.options.chart.events.redraw(), 5000);
            //$scope.$watch('date.from', $scope.currentChartConfig.options.chart.events.redraw());
            //setTimeout($scope.realTimeCurrentConfig.options.chart.events.redraw(), 5000);
            //setTimeout($scope.realTimePowerConfig.options.chart.events.redraw(), 5000);
        }

        /*var check;

        $scope.$watch(function() { return $document.element("#realtimeView").hasClass('active') }, function() {
            alert("cool");
        });*/

        $scope.setReal = function()
        {
            currentG = false;
            realT = true;
            kwG = false;
            //$scope.currentChartConfig.options.chart.events.redraw();
            //console.log("current: " + currentG + "real: " + realT);
            //alert($document.find("").hasClass('active'));
            while(!realT)
            {

            }
            //alert("lpg2");
            //setTimeout($scope.realTimeCurrentConfig.options.chart.events.redraw(), 5000);
            //setTimeout($scope.realTimePowerConfig.options.chart.events.redraw(), 5000);
        }




        //$scope.currentChartConfig = CurrentChart;

        if($scope.date === undefined) {
            $scope.date = {};
            $scope.date.from = new Date();
            $scope.date.to = new Date($scope.date.from);
        }
        $scope.dateP = {};
        $scope.dateP.from = new Date();

        $scope.progressbar = ngProgressFactory.createInstance();
        $scope.progressbar.setColor('#ffe11c');
        $scope.progressbar.height = '3px';

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
                        redraw: function () {
                            if(currentG==true) {
                                var date2 = new Date($scope.date.from);
                                console.log(date2);
                                $scope.tempCurrentData = [];
                                var dateSelected = {};
                                dateSelected.year = date2.getFullYear();
                                dateSelected.month = date2.getMonth();
                                dateSelected.day = date2.getDate() - 1;
                                console.log(dateSelected.year);
                                console.log(dateSelected.month);
                                console.log(dateSelected.day);

                                var referenceLink = "/device_data/" + device_ID + "/" + dateSelected.year + "/" + dateSelected.month + "/" + dateSelected.day;
                                var data = firebase.database().ref(referenceLink);
                                console.log(referenceLink);
                                data.once('value').then(function (snapshot) {
                                    snapshot.forEach(function (d) {
                                        var temp = [];

                                        temp.push((d.val().datetime + (2*3600))*1000);
                                        temp.push(d.val().current);
                                        $scope.tempCurrentData.push(temp);

                                    });
                                    $scope.currentChartConfig.series[0].data = $scope.tempCurrentData;
                                    console.log($scope.currentChartConfig.series[0].data);
                                    $scope.currentChartConfig.loading = false;
                                    $scope.$apply();
                                    if(currentG==true) {
                                        setTimeout($scope.currentChartConfig.options.chart.events.redraw(), 10000);
                                    }
                                    return;

                                });
                            }
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
                    panKey: 'shift',
                    events: {
                        redraw: function () {
                            if (kwG == true) {
                                var date2 = new Date($scope.dateP.from);
                                console.log(date2);
                                $scope.tempPowerData = [];
                                var dateSelected = {};
                                dateSelected.year = date2.getFullYear();
                                dateSelected.month = date2.getMonth();
                                dateSelected.day = date2.getDate() - 1;
                                console.log(dateSelected.year);
                                console.log(dateSelected.month);
                                console.log(dateSelected.day);

                                var referenceLink = "/device_data/" + device_ID + "/" + dateSelected.year + "/" + dateSelected.month + "/" + dateSelected.day;
                                var data = firebase.database().ref(referenceLink);
                                console.log(referenceLink);
                                data.once('value').then(function (snapshot) {
                                    snapshot.forEach(function (d) {
                                        var temp = [];

                                        temp.push((d.val().datetime + (2*3600))*1000);
                                        temp.push(d.val().power);
                                        $scope.tempPowerData.push(temp);

                                    });
                                    $scope.powerChartConfig.series[0].data = $scope.tempPowerData;
                                    console.log($scope.powerChartConfig.series[0].data);
                                    $scope.powerChartConfig.loading = false;
                                    $scope.$apply();
                                    if (kwG == true) {
                                        setTimeout($scope.powerChartConfig.options.chart.events.redraw(), 10000);
                                    }
                                    return;

                                });
                            }
                        }
                    }
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

        $scope.realTimeCurrentConfig = {
            options: {
                chart: {
                    type: 'areaspline',
                    zoomType: 'x',
                    panning: true,
                    panKey: 'shift',
                    events: {
                        redraw: function () {
                            if(realT==true) {
                                var dateFrom = new Date();

                                $scope.tempCurrentData = [];
                                var dateSelected = {};
                                dateSelected.year = dateFrom.getFullYear();
                                dateSelected.month = dateFrom.getMonth();
                                dateSelected.day = dateFrom.getDate() - 1;
                                console.log(dateSelected.year);
                                console.log(dateSelected.month);
                                console.log(dateSelected.day);
                                console.log("here realtime");
                                var referenceLink = "/device_data/" + device_ID + "/" + dateSelected.year + "/" + dateSelected.month + "/" + dateSelected.day;
                                var data = firebase.database().ref(referenceLink);
                                console.log(referenceLink);
                                data.on('value', function (snapshot) {

                                    snapshot.forEach(function (d) {
                                        //
                                        if(realT==true) {
                                        var year = dateFrom.getFullYear();
                                        var month = dateFrom.getMonth();
                                        var day = dateFrom.getDate();
                                        snapshot = d.child(year + "/" + month + "/" + day);
                                        var temp = [];

                                        temp.push((d.val().datetime + (2*3600))*1000);
                                        temp.push(d.val().current);
                                        $scope.tempCurrentData.push(temp);
                                        //series.addPoint(temp);
                                        }
                                        else
                                            data.off();
                                            console.log("off");
                                    });

                                    $scope.realTimeCurrentConfig.series[0].data = $scope.tempCurrentData;
                                    //console.log($scope.realTimeCurrentConfig.series[0].data);
                                    $scope.realTimeCurrentConfig.loading = false;
                                    $scope.$apply();


                                });
                            }


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

        $scope.realTimePowerConfig = {
            options: {
                chart: {
                    type: 'areaspline',
                    zoomType: 'x',
                    panning: true,
                    panKey: 'shift',
                    events: {
                        redraw: function () {
                            if(realT==true) {
                                var dateFrom = new Date();

                                $scope.tempPowerData = [];
                                var dateSelected = {};
                                dateSelected.year = dateFrom.getFullYear();
                                dateSelected.month = dateFrom.getMonth();
                                dateSelected.day = dateFrom.getDate() - 1;
                                console.log(dateSelected.year);
                                console.log(dateSelected.month);
                                console.log(dateSelected.day);
                                console.log("here realtime");
                                var referenceLink = "/device_data/" + device_ID + "/" + dateSelected.year + "/" + dateSelected.month + "/" + dateSelected.day;
                                var data = firebase.database().ref(referenceLink);
                                console.log(referenceLink);
                                data.on('value', function (snapshot) {

                                        snapshot.forEach(function (d) {

                                            if(realT==true)
                                        {
                                        var year = dateFrom.getFullYear();
                                        var month = dateFrom.getMonth();
                                        var day = dateFrom.getDate();
                                        snapshot = d.child(year + "/" + month + "/" + day);
                                        var temp = [];

                                        temp.push((d.val().datetime + (2*3600))*1000);
                                        temp.push(d.val().power);
                                        $scope.tempPowerData.push(temp);
                                        //series.addPoint(temp);
                                        }
                                            else
                                                data.off();
                                    });

                                    $scope.realTimePowerConfig.series[0].data = $scope.tempPowerData;
                                    //console.log($scope.realTimeCurrentConfig.series[0].data);
                                    $scope.realTimePowerConfig.loading = false;
                                    $scope.$apply();

                                });
                            }
                        }
                    }
                }
            },
            yAxis: {
                title: {
                    text: 'KiloWatt'
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
                text: 'Kilowatt'
            },
            series: [{
                name: 'kW',
                data: $scope.tempPowerData
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
            $scope.totalEmission = $scope.avgEmission.toFixed(2);
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
            $scope.totalCost = $scope.avgCost.toFixed(2);
            $scope.avgCost = $scope.avgCost / Cost.length;
            $scope.avgCost = $scope.avgCost.toFixed(2);
        }

        function populateCurrentChart()
        {
            var id;
            var length = $scope.allCurrentData.length;
            var log = [];
            var devices = [];
            var count = 0;

            angular.forEach($scope.allCurrentData, function(value, key)
            {
                id = value[0];
                console.log("Value id " + value[0]);
                if(!contains(devices,id))
                {
                    devices.push(id);
                }
                $scope.totalCurrent += parseFloat(value[2]);
            }, log);

            var currentID = devices[0];
            var specificTotal = 0;
            var ave = 0;
            var percent = 0.0;
            var temp = [];
            var length = $scope.allCurrentData.length;

            angular.forEach($scope.allCurrentData, function(value, key)
            {
                if(count == 0)
                {
                    console.log(getName(currentID));
                    temp.push(getName(currentID));
                }

                if(value[0] != currentID)
                {
                    ave = specificTotal/$scope.totalCurrent;
                    ave = ave.toFixed(4);
                    percent = ave*100.0000;
                    temp.push(percent);

                    $scope.allCurrentDataPI.push(temp);
                    temp = [];

                    currentID = value[0];
                    console.log(getName(currentID));
                    temp.push(getName(currentID));
                    specificTotal = 0.0;
                }

                specificTotal += parseFloat(value[2]);
                count++;
                if(count == length)
                {
                    ave = specificTotal/$scope.totalCurrent;
                    ave = ave.toFixed(4);
                    percent = ave*100.0000;
                    temp.push(percent);
                    $scope.allCurrentDataPI.push(temp);
                }
            }, log);
        }

        function fetchData(id)
        {


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
