'use strict';

/**
 * @ngdoc function
 * @name powerCloud.controller:MainCtrl
 * @description Controller to display & interact with device data.
 * # MainCtrl
 * Controller of powerCloud
 */
angular.module('powerCloud')
    .controller('ReportsCtrl', function( $scope, $location, $state, $document, $timeout, ngProgressFactory, sharedProperties, userDataService, Upload )
    {
        $scope.$state = $state;

        var user = firebase.auth().currentUser;

        if (!user) {
            $location.path('/login');
            $scope.$apply();
        }


        var device = $scope.selectedDevice;
        var device_ID = $scope.deviceID;
        if (!device) {
            $location.path('/dashboard/devices');
            $scope.$apply();
        }

        var currentG = false;
        var realT = false;
        var kwG = false;
        $scope.setOverview = function()
        {
            currentG = false;
            realT = false;
            kwG = false;
            console.log("current: " + currentG + "real: " + realT);
        };

        $scope.setKw = function()
        {
            currentG = false;
            realT = false;
            kwG = true;
            setTimeout($scope.powerChartConfig.options.chart.events.redraw(), 5000);
            console.log("current: " + currentG + "real: " + realT);
        };

        $scope.setCurrent = function()
        {
            currentG = true;
            realT = false;
            kwG = false;
            console.log("current: " + currentG + "real: " + realT);
            setTimeout($scope.currentChartConfig.options.chart.events.redraw(), 5000);
        };

        $scope.setReal = function()
        {
            currentG = false;
            realT = true;
            kwG = false;
            getRealTime();
            setTimeout($scope.realTimePowerConfig.options.chart.events.redraw(), 5000);
        };

        var particle = new Particle();

        $scope.deviceActive = device.active;
        $scope.togglePowerStatusChange = true;


        $scope.togglingDevice = false;
        $scope.toggleResult = null;

        $scope.changeNameSuccess = false;
        $scope.changeNameFailure = false;

        $scope.emailChangeResult = false;
        $scope.emailChangeResultText = '';

        $scope.flashinInProgress = false;
        $scope.firmwareFileUploaded = null;
        $scope.firmwareFileFlashed = null;
        $scope.firmwareFileUploadTxt = '';
        $scope.firmwareFileFlashTxt = '';

        $scope.intervalSelected = -1;
        $scope.changingInterval = false;
        $scope.changeIntervalResult = null;
        $scope.changeIntervalText = '';

        $scope.intervalsAvailable = [{name:'30 Seconds',value:30},
                                    {name:'1 Minute',value:60},
                                    {name:'10 Minutes',value:600},
                                    {name:'30 Minutes',value:1800},
                                    {name:'1 Hour',value:3600}];

        $scope.currentThreshold = 0.0;
        $scope.currentThresholdChanging = false;
        $scope.currentThresholdChangeResult = null;
        $scope.currentThresholdResultText = '';

        if($scope.date === undefined) {
            $scope.date = {};
            $scope.date.from = new Date();
            $scope.date.to = new Date($scope.date.from);
        }
        $scope.dateP = {};
        $scope.dateP.from = new Date();
        $scope.dateS = {};
        $scope.dateS.from = new Date();
        $scope.lastUpdate = new Date();

        $scope.relayStatusText = 'Unknown';
        $scope.relayStatus = false;

        $scope.progressbar = ngProgressFactory.createInstance();


        $scope.progressbar.setColor('#ffe11c');
        $scope.progressbar.height = '3px';

        $scope.firmwareFile = null;

        var i;

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
                name: 'kWh',
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

        function fetchData() {

            $scope.tempCurrentData=[];
            $scope.tempPowerData=[];
            $scope.tempCostData=[];
            $scope.tempEmissionData=[];
            var date2 = new Date($scope.dateS.from);
            var dateSelected = {};
            dateSelected.year = date2.getFullYear();
            dateSelected.month = date2.getMonth();
            dateSelected.day = date2.getDate()-1;
            $scope.deviceID = device_ID;
            var deviceSelected = device_ID;
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
                $scope.progressbar.complete();
                $scope.$apply();

            });
        }

        function getParticleToken() {
            if (sharedProperties.getParticleToken() == null) {
                var data = firebase.database().ref('/userdata/particle/access_token');

                data.once('value').then(function(snapshot) {
                    sharedProperties.setParticleToken(snapshot.val());
                    checkDeviceStatus();
                    $scope.$apply();
                });
            }
            else {
                checkDeviceStatus();
            }
        }

        function getRealTime() {
            var authToken = sharedProperties.getParticleToken();
            var jsonObj;
            var tempCurrent = [];
            var tempPower = [];
            $scope.tempCurrentRealTime = [];
            $scope.tempPowerRealTime = [];
            setInterval(function() {
                tempCurrent = [];
                tempPower = [];
                if(authToken != null) {
                    var varParticle = particle.getVariable({deviceId: device_ID, name: 'realTime', auth: authToken});
                }
                else
                    console.log("Autherisation token null line 506")
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
                        $scope.togglePowerStatusChange = false;
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

        $scope.fetchData = function() {

            fetchData(device_ID);
        };

        $scope.toggleDevicePower = function() {
            $scope.togglePowerStatusChange = true;
            var userEmail = firebase.auth().currentUser.email;
            var authToken = sharedProperties.getParticleToken();
            if (authToken != null) {

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

        $scope.changeDeviceName = function() {
            $scope.progressbar.start();

            var newName = $scope.deviceNewName;

            //Change the device name on Particle first
            particle.renameDevice({ deviceId: device_ID, name: newName, auth: sharedProperties.getParticleToken() }).then(function(data) {
                console.log('(Particle) Device renamed successfully:', data);

                $scope.changeNameSuccess = true;
                $scope.changeNameFailure = false;

                //Change the device name on firebase
                var refLink = 'meta_data/' + device_ID + '/';
                firebase.database().ref(refLink).update({
                    name: newName
                }).catch(function(onReject) {

                    $scope.changeNameSuccess = false;
                    $scope.changeNameFailure = true;

                    console.log(onReject);

                }).then(function(value) {

                    $scope.changeNameSuccess = true;
                    $scope.changeNameFailure = false;
                    $scope.progressbar.complete();

                });

            }, function(err) {
                console.log('(Particle) An error occurred while renaming device:', err);

                $scope.changeNameSuccess = false;
                $scope.changeNameFailure = true;
            });


        };

        $scope.flashFirmware = function(file, errFiles) {

            $scope.flashinInProgress = true;

            var storageRef = firebase.storage().ref().child('firmware/' + device_ID);
            $scope.firmwareFile = file;
            var firmwareRef = storageRef.child(file.name);

            firmwareRef.put(file)
                .then(function(snapshot) {

                    $scope.firmwareFileUploaded = true;
                    $scope.firmwareFileUploadTxt = 'Firmware uploaded by \n' + firebase.auth().currentUser.email;
                    $scope.$apply();

                    //Flash the firmware
                    particle.flashDevice({ deviceId: device_ID, files: { file1: file }, auth: sharedProperties.getParticleToken() })
                        .then(function(data) {

                            $scope.firmwareFileFlashed = true;
                            $scope.firmwareFileFlashTxt = 'Device successfully flashed.';
                            $scope.$apply();

                        }, function(err) {
                            $scope.firmwareFileFlashed = false;
                            $scope.firmwareFileFlashTxt = 'Device flashing has failed.';
                            $scope.$apply();
                        });

                })
                .catch(function(error) {
                    $scope.firmwareFileUploaded = false;
                    $scope.firmwareFileUploadTxt = 'File upload failed.';
                    $scope.$apply();
                });
            $scope.flashinInProgress = false;

        };

        $scope.toggleDevice = function () {

            $scope.togglingDevice = true;

            if ($scope.deviceActive) {

                firebase.database().ref('meta_data/' + device_ID + '/').update({
                    active: false
                }).catch(function(onReject) {

                    $scope.togglingDevice = false;
                    $scope.toggleResult = false;
                    $scope.$apply();

                }).then(function(value) {

                    var userEmail = firebase.auth().currentUser.email;
                    var authToken = sharedProperties.getParticleToken();

                    if (authToken != null) {
                        var fnPr = particle.callFunction({ deviceId: device_ID, name: 'measureTog', argument: userEmail, auth: authToken });
                        fnPr.then(
                            function (data) {

                                $scope.toggleResult = true;
                                $scope.deviceActive = false;
                                $scope.togglingDevice = false;
                                $scope.$apply();

                            }, function(err) {

                                $scope.toggleResult = true;
                                $scope.deviceActive = false;
                                $scope.togglingDevice = false;
                                $scope.$apply();
                            });
                    } else {
                        console.log('Please log in to Particle. Auth token null.');
                    }
                });
            }
            else
            {
                //Enable Device
                firebase.database().ref('meta_data/' + device_ID + '/').update({
                    active: true
                }).catch(function(onReject) {

                    $scope.toggleResult = false;
                    console.log(onReject);

                }).then(function(value) {
                    var userEmail = firebase.auth().currentUser.email;
                    var authToken = sharedProperties.getParticleToken();
                    if (authToken != null) {
                        var fnPr = particle.callFunction({ deviceId: device_ID, name: 'measureTog', argument: userEmail, auth: authToken });
                        fnPr.then(
                            function (data) {

                                $scope.toggleResult = true;
                                $scope.deviceActive = true;
                                $scope.togglingDevice = false;
                                $scope.$apply();

                            }, function(err) {
                                $scope.toggleResult = true;
                                $scope.deviceActive = true;
                                $scope.togglingDevice = false;
                                $scope.$apply();
                            });
                    } else {
                        console.log('Please log in to Particle. Auth token null.');
                    }
                });
            }
        };

        $scope.toggleDeviceModalClose = function() {
            $scope.toggleResult = null;
        };

        $scope.updateNotificationEmail = function() {
            $scope.progressbar.start();

            var email = $scope.notificationEmail;
            if (email != null) {
                var refLink = 'meta_data/' + device_ID + '/';

                firebase.database().ref(refLink).update({
                    notificationEmail:email
                }).catch(function(onReject) {
                    $scope.emailChangeResultText = onReject.message;
                    $scope.emailChangeResult = false;
                    $scope.progressbar.complete();
                }).then(function(value) {
                    $scope.emailChangeResultText = 'Notification Email updated.';
                    $scope.emailChangeResult = true;
                    $scope.progressbar.complete();
                });

            }

        };

        $scope.setInterval = function() {

            $scope.changeIntervalResult = null;
            $scope.changingInterval = true;
            var userEmail = firebase.auth().currentUser.email;
            var token = sharedProperties.getParticleToken();
            var argument = userEmail + ',' + $scope.intervalSelected;

            if (token != null) {
                var fnPr = particle.callFunction({ deviceId: device_ID, name: 'setPeriod', argument: argument, auth: token });
                fnPr.then(
                    function (data) {
                        $scope.changeIntervalResult = true;
                        $scope.changingInterval = false;
                        $scope.changeIntervalText = 'Success.';
                        $scope.$apply();

                    }, function(err) {

                        $scope.changeIntervalResult = false;
                        $scope.changingInterval = false;
                        $scope.changeIntervalText = 'Error: ' + err;
                        $scope.$apply();

                    });
            } else {
                console.log('Please log in to Particle. Auth token null.');
            }
        };

        $scope.setIntervalModalClose = function() {
            $scope.changeIntervalResult = null;
        };

        $scope.setThreshold = function() {
            $scope.currentThresholdChangeResult = null;
            $scope.currentThresholdChanging = true;
            var userEmail = firebase.auth().currentUser.email;
            var token = sharedProperties.getParticleToken();
            var argument = userEmail + ',' + $scope.currentThreshold;

            if (token != null) {
                var fnPr = particle.callFunction({ deviceId: device_ID, name: 'setThreshold', argument: argument, auth: token });
                fnPr.then(
                    function (data) {
                        $scope.currentThresholdChanging = false;
                        $scope.currentThresholdChangeResult = true;
                        $scope.currentThresholdResultText = 'Success.';
                        checkDeviceStatus();
                        $scope.$apply();

                    }, function(err) {
                        $scope.currentThresholdChanging = false;
                        $scope.currentThresholdChangeResult = false;
                        $scope.currentThresholdResultText = 'Failure: ' + err;
                        checkDeviceStatus();
                        $scope.$apply();
                    });
            } else {
                console.log('Please log in to Particle. Auth token null.');
            }
        };

        $scope.setThresholdModalClose = function() {
            $scope.currentThresholdChangeResult = null;
        };
    });
