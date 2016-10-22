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
    .controller('ReportsCtrl', function( $scope, $location, $state, $document, $timeout, ngProgressFactory, sharedProperties, userDataService, Upload )
    {
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
        }

        $scope.setReal = function()
        {
            currentG = false;
            realT = true;
            kwG = false;
            getRealTime();
            setTimeout($scope.realTimePowerConfig.options.chart.events.redraw(), 5000);
        }




        //$scope.currentChartConfig = CurrentChart;

        var particle = new Particle();
        var device = $scope.selectedDevice;
        var device_ID = $scope.deviceID;

        $scope.deviceActive = device.active;
        $scope.togglingDevice = false;
        $scope.toggleResult = null;

        if($scope.date === undefined) {
            $scope.date = {};
            $scope.date.from = new Date();
            $scope.date.to = new Date($scope.date.from);
        }
        $scope.dateP = {};
        $scope.dateP.from = new Date();

        $scope.lastUpdate = new Date();

        $scope.relayStatusText = 'Unknown';
        $scope.relayStatus = false;

        $scope.progressbar = ngProgressFactory.createInstance();
        $scope.changeNameProgress = ngProgressFactory.createInstance();


        $scope.progressbar.setColor('#ffe11c');
        $scope.progressbar.height = '3px';

        $scope.changeNameProgress.setColor('#ffe11c');
        $scope.changeNameProgress.height = '3px';

        $scope.firmwareFile = null;

        var i;

        console.log("Device Active: " + device.active);

        $scope.voltage = 0.0;

        $scope.tempCurrentData = [];
        $scope.tempPowerData = [];
        $scope.tempCostData = [];
        $scope.tempEmissionData = [];
        $scope.tempCategories = [];
        $scope.tempCurrentRealTime = [];
        $scope.tempPowerRealTime = [];

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
                                $scope.tempCurrentData = [];
                                var dateSelected = {};
                                dateSelected.year = date2.getFullYear();
                                dateSelected.month = date2.getMonth();
                                dateSelected.day = date2.getDate() - 1;
                                var referenceLink = "/device_data/" + device_ID + "/" + dateSelected.year + "/" + dateSelected.month + "/" + dateSelected.day;
                                var data = firebase.database().ref(referenceLink);
                                data.once('value').then(function (snapshot) {
                                    snapshot.forEach(function (d) {
                                        var temp = [];
                                        temp.push((d.val().datetime + (2*3600))*1000);
                                        temp.push(d.val().current);
                                        $scope.tempCurrentData.push(temp);

                                    });
                                    $scope.currentChartConfig.series[0].data = $scope.tempCurrentData;
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
                                $scope.tempPowerData = [];
                                var dateSelected = {};
                                dateSelected.year = date2.getFullYear();
                                dateSelected.month = date2.getMonth();
                                dateSelected.day = date2.getDate() - 1;
                                var referenceLink = "/device_data/" + device_ID + "/" + dateSelected.year + "/" + dateSelected.month + "/" + dateSelected.day;
                                var data = firebase.database().ref(referenceLink);
                                data.once('value').then(function (snapshot) {
                                    snapshot.forEach(function (d) {
                                        var temp = [];

                                        temp.push((d.val().datetime + (2*3600))*1000);
                                        temp.push(d.val().power);
                                        $scope.tempPowerData.push(temp);

                                    });
                                    $scope.powerChartConfig.series[0].data = $scope.tempPowerData;
                                    $scope.powerChartConfig.loading = false;
                                    $scope.$apply();
                                    if (kwG == true) {
                                        setTimeout($scope.powerChartConfig.options.chart.events.redraw(), 10000);
                                    }
                                    else
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
                                    $scope.realTimeCurrentConfig.series[0].data = $scope.tempCurrentRealTime;
                                    console.log($scope.realTimeCurrentConfig.series[0].data);
                                    $scope.realTimeCurrentConfig.loading = false;
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
                data: $scope.tempCurrentRealTime
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
                                    $scope.realTimePowerConfig.series[0].data = $scope.tempPowerRealTime;
                                    $scope.realTimePowerConfig.loading = false;
                        }
                    }
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
                text: 'Power'
            },
            series: [{
                name: 'kW',
                data: $scope.tempPowerRealTime
            }],

            loading: true
        };

        fetchData(device_ID);
        getParticleToken();

        function calculations(Current, Power, Cost, Emission) {
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

        function fetchData(id) {

        }

        function getParticleToken() {
            if (sharedProperties.getParticleToken() == null) {
                var data = firebase.database().ref('/userdata/particle/access_token');

                data.once('value').then(function(snapshot) {
                    sharedProperties.setParticleToken(snapshot.val());
                });
                checkDeviceStatus();
            }
            else {
                checkDeviceStatus();
            }
        }

        function getRealTime() {
            var authToken = 'ff73c3f9cadc50cc0b6079d9994cc7550e3f6fca';
            var jsonObj;
            var tempCurrent = [];
            var tempPower = [];
            $scope.tempCurrentRealTime = [];
            setInterval(function() {
                tempCurrent = [];
                tempPower = [];
                if(authToken != null) {
                    var varParticle = particle.getVariable({deviceId: device_ID, name: 'realTime', auth: authToken});
                }
                varParticle.then(function(data){
                    jsonObj = "";
                    jsonObj = JSON.parse(data.body.result);
                });
                tempCurrent.push((jsonObj.time + (2*3600))*1000);
                tempCurrent.push(jsonObj.current);
                tempPower.push((jsonObj.time + (2*3600))*1000);
                tempPower.push(jsonObj.power);
                $scope.tempCurrentRealTime.push(tempCurrent);
                $scope.tempPowerRealTime.push(tempPower);
                $scope.$apply();
                $scope.realTimeCurrentConfig.options.chart.events.redraw();
                $scope.realTimePowerConfig.options.chart.events.redraw();
            }, 5000);


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

        $scope.toggleDevicePower = function() {

            var userEmail = firebase.auth().currentUser.email;
            if (sharedProperties.getParticleToken() != null) {

                var fnPr = particle.callFunction({ deviceId: device_ID, name: 'relayToggle', argument: userEmail, auth: authToken });

                fnPr.then(
                    function (data) {
                        //console.log('Function called succesfully:', data);
                        checkDeviceStatus();
                    }, function(err) {
                        //console.log('An error occurred:', err);
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

            var newName = $scope.deviceNewName;

            //Change the device name on Particle first
            particle.renameDevice({ deviceId: device_ID, name: newName, auth: sharedProperties.getParticleToken() }).then(function(data) {
                console.log('(Particle) Device renamed successfully:', data);

                $scope.changeNameSuccess = true;
                $scope.changeNameFailure = false;

                //Change the device name on firebase
                var refLink = 'meta_data/' + id + '/';
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

            }, function(err) {
                console.log('(Particle) An error occurred while renaming device:', err);

                $scope.changeNameSuccess = false;
                $scope.changeNameFailure = true;
            });


        };

        $scope.uploadFirmware = function(file, errFiles) {

            var storageRef = firebase.storage().ref().child('firmware/' + device_ID);
            $scope.firmwareFile = file;
            var firmwareRef = storageRef.child(file.name);

            console.log('Uploading: ' + file);

            firmwareRef.put(file).then(function(snapshot) {
                console.log('File successfully uploaded to firebase.');
            });
        };

        $scope.toggleDevice = function () {

            $scope.togglingDevice = true;

            if ($scope.deviceActive) {
                //Disable Device
                firebase.database().ref('meta_data/' + device_ID + '/').update({
                    active: false
                }).catch(function(onReject) {

                    $scope.toggleResult = false;
                    console.log(onReject);

                }).then(function(value) {

                    $scope.toggleResult = true;
                    $scope.deviceActive = false;
                    $scope.togglingDevice = false;

                    $scope.$apply();
                    console.log("Device disabled.");
                });

            }
            else {
                //Enable Device
                firebase.database().ref('meta_data/' + device_ID + '/').update({
                    active: true
                }).catch(function(onReject) {

                    $scope.toggleResult = false;
                    console.log(onReject);

                }).then(function(value) {

                    $scope.toggleResult = true;
                    $scope.deviceActive = true;
                    $scope.togglingDevice = false;

                    $scope.$apply();
                    console.log("Device enabled.");
                });
            }
        };

        $scope.toggleDeviceModalClose = function() {
            $scope.toggleResult = null;
        }
    });
