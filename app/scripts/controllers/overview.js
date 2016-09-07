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

        $scope.dateStringBegin = new Date();
        $scope.dateStringEnd = new Date();

        $scope.progressbar = ngProgressFactory.createInstance();
        $scope.progressbar.setColor('#ffe11c');
        $scope.progressbar.height = '3px';

        $scope.allCurrentData = [];
        $scope.allCurrentDataPI = [];

        $scope.allPowerData = [];
        $scope.allPowerDataPI = [];

        $scope.device = [];
        $scope.dateSelected = false;

        $scope.name = "";
        $scope.totalCurrent = 0;
        $scope.totalPower = 0;


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

        $scope.overviewCurrentPIConfig = {
            options: {
                chart:
                {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                    type: 'pie'
                }
            },
            title: {
                text: 'Current Usage Percentage'
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                        style: {
                            color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                        }
                    }
                }
            },
            series: [{
                name: 'Devices',
                colorByPoint: true,
                data: $scope.allCurrentDataPI
            }],

            loading : true
        };


        $scope.overviewPowerPIConfig = {
            options: {
                chart:
                {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                    type: 'pie'
                }
            },
            title: {
                text: 'Power Usage Percentage'
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                        style: {
                            color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                        }
                    }
                }
            },
            series: [{
                name: 'Devices',
                colorByPoint: true,
                data: $scope.allPowerDataPI
            }],

            loading : true
        };

        var referenceLink = "/statistics";
        var data = firebase.database().ref(referenceLink);
        var dataSnapshot;

        data.once('value').then(function(snapshot) {
            dataSnapshot = snapshot;
        });

        if (dataSnapshot == null)
        {

            //fetchAllData();
        }
        else
        {

        }

        function fetchAllData()
        {
            var referenceLink = "device_data/";
            var data = firebase.database().ref(referenceLink);

            var beginHolder = $scope.dateStringBegin;
            var endHolder = $scope.dateStringEnd;

            var begin = $scope.dateStringBegin;
            console.log("Begin Date " + begin);
            var end = $scope.dateStringEnd;
            console.log("End Date " + end);

            data.once('value').then(function(snapshot)
            {
                snapshot.forEach(function (d)
                {
                    var id = d.key;
                    var temp;
                    var count = 0;
                    while(begin <= end)
                    {
                        var year = begin.getFullYear();
                        var month = begin.getMonth();
                        var day = begin.getDate();
                        day -= 1;

                        temp = d.child(year + "/" + month + "/" + day);

                        temp.forEach(function (stuff)
                        {
                            var curr = [];
                            var pow = [];

                            curr.push(id);
                            curr.push(stuff.val().datetime * 1000);
                            curr.push(stuff.val().current);

                            pow.push(id);
                            pow.push(stuff.val().datetime * 1000);
                            pow.push(stuff.val().power);

                            $scope.allCurrentData.push(curr);
                            $scope.allPowerData.push(pow);
                        });
                        begin.setDate(begin.getDate() + 1);
                        count++;
                    }
                    begin.setDate(begin.getDate() - count);
                });
                $scope.progressbar.start();
                populateCurrentPi();
                populatePowerPi();
                $scope.overviewCurrentConfig.loading = false;
                $scope.overviewPowerConfig.loading = false;
                $scope.overviewCurrentPIConfig.loading = false;
                $scope.overviewPowerPIConfig.loading = false;
                $scope.progressbar.complete();
                $scope.$apply();
            });
        }

        function populateCurrentPi()
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
                    temp.push(currentID);
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
                    temp.push(currentID);
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

        function populatePowerPi()
        {
            var id;
            var length = $scope.allPowerData.length;
            var log = [];
            var devices = [];
            var count = 0;

            angular.forEach($scope.allPowerData, function(value, key)
            {
                id = value[0];
                console.log("Value id " + value[0]);
                if(!contains(devices,id))
                {
                    devices.push(id);
                }
                $scope.totalPower += parseFloat(value[2]);
            }, log);

            var currentID = devices[0];
            var specificTotal = 0;
            var percent = 0.0;
            var temp = [];
            var length = $scope.allPowerData.length;
            var ave = 0;

            angular.forEach($scope.allPowerData, function(value, key)
            {
                if(count == 0)
                {
                    temp.push(currentID);
                }

                if(value[0] != currentID)
                {
                    ave = specificTotal/$scope.totalPower;
                    ave = ave.toFixed(4);
                    percent = ave*100.0;
                    temp.push(percent);

                    $scope.allPowerDataPI.push(temp);
                    temp = [];

                    currentID = value[0];
                    temp.push(currentID);
                    specificTotal = 0.0;
                }

                specificTotal += parseFloat(value[2]);
                count++;
                if(count == length)
                {
                    ave = specificTotal/$scope.totalPower;
                    ave = ave.toFixed(4);
                    percent = ave*100.0000;
                    temp.push(percent);
                    $scope.allPowerDataPI.push(temp);
                }
            }, log);
        }

        function contains(device, id)
        {
            for(var i = 0 ; i < device.length ; i++)
            {
                if(device[i] == id)
                    return true;
            }
            return false;
        }

        $scope.genReport = function()
        {
            fetchAllData();
            $scope.dateSelected = true;
        }
    });
