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
    .controller('OverviewCtrl', function($scope, $state, ngProgressFactory, CurrentPI, PowerPI, CostPI) {

        $scope.overviewCurrentPIConfig = CurrentPI;
        $scope.overviewPowerPIConfig = PowerPI;
        $scope.overviewCostPIConfig = CostPI;
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

        $scope.allCalculationsData = [];

        $scope.allCostData = [];
        $scope.allCostDataPI = [];

        $scope.allEmissionData = [];
        $scope.allEmissionDataPI = [];

        $scope.totalEmission = [];
        $scope.totalCost = 0;

        $scope.deviceMeta = [];
        $scope.dateSelected = false;

        $scope.name = "";
        $scope.totalCurrent = 0;
        $scope.totalPower = 0;

        $scope.highest_power = "";
        $scope.lowest_power = "";

        $scope.highest_current = "";
        $scope.lowest_current = "";

        $scope.highest_emissions = "";
        $scope.lowest_emissions = "";

        $scope.highest_cost = "";
        $scope.lowest_cost = "";

        function fetchAllData()
        {
            var referenceLink = "/";
            var data = firebase.database().ref(referenceLink);

            var beginHolder = $scope.dateStringBegin;
            var endHolder = $scope.dateStringEnd;

            var begin = $scope.dateStringBegin;
            console.log("Begin Date " + begin);
            var end = $scope.dateStringEnd;
            console.log("End Date " + end);

            data.once('value').then(function(snapshot)
            {
                console.log(snapshot.val());
                var temp = snapshot.child("device_data");
                temp.forEach(function (d)
                {
                    var id = d.key;
                    console.log("ID - " + id);
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
                            var calculations = [];

                            curr.push(id);
                            curr.push(stuff.val().datetime * 1000);
                            curr.push(stuff.val().current);

                            pow.push(id);
                            pow.push(stuff.val().datetime * 1000);
                            pow.push(stuff.val().power);

                            var obj = stuff.val();
                            var t = JSON.stringify(obj);
                            obj = JSON.parse(t);

                            calculations.push(id);
                            calculations.push(obj.calculations.cost);
                         //   calculations.push(obj.calculations.emission);

                            $scope.allCalculationsData.push(calculations);
                            $scope.allCurrentData.push(curr);
                            $scope.allPowerData.push(pow);
                        });
                        begin.setDate(begin.getDate() + 1);
                        count++;
                    }
                    begin.setDate(begin.getDate() - count);
                });

                temp = snapshot.child("meta_data");
                temp.forEach(function (d)
                {
                    var meta = [];
                    var id = d.key;
                    meta.push(id);
                    meta.push(d.val().appliance);
                    meta.push(d.val().name);

                    $scope.deviceMeta.push(meta);
                });
                $scope.progressbar.start();

               // console.log(" ----------------------------- \n" + $scope.allCalculationsData + "\n ----------------------------- ");
                populateCurrentPi();
                populatePowerPi();
                populateCostPi();
                populateOverviewTable();
                //$scope.overviewCurrentConfig.loading = false;
                //$scope.overviewPowerConfig.loading = false;
                $scope.overviewCurrentPIConfig.loading = false;
                $scope.overviewPowerPIConfig.loading = false;
                $scope.overviewCostPIConfig.loading = false;
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
                    console.log(getName(currentID));
                    temp.push(getName(currentID));
                }

                if(value[0] != currentID)
                {
                    ave = specificTotal/$scope.totalCurrent;
                    ave = ave.toFixed(2);
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
                    ave = ave.toFixed(2);
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
                    console.log(getName(currentID));
                    temp.push(getName(currentID));
                }

                if(value[0] != currentID)
                {
                    ave = specificTotal/$scope.totalPower;
                    ave = ave.toFixed(2);
                    percent = ave*100.0;
                    temp.push(percent);

                    $scope.allPowerDataPI.push(temp);
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
                    ave = specificTotal/$scope.totalPower;
                    ave = ave.toFixed(2);
                    percent = ave*100.0000;
                    temp.push(percent);
                    $scope.allPowerDataPI.push(temp);
                }
            }, log);
        }

        function populateCostPi()
        {
            var id;
            var length = $scope.allCalculationsData.length;
            var log = [];
            var devices = [];
            var count = 0;

            angular.forEach($scope.allCalculationsData, function(value, key)
            {
                id = value[0];
                console.log("Value id " + value[0]);
                if(!contains(devices,id))
                {
                    devices.push(id);
                }
                $scope.totalCost += parseFloat(value[1]);
                console.log("----------\n" + $scope.totalCost + "\n");
            }, log);

            var currentID = devices[0];

            var specificTotal = 0;
            var percent = 0.0;
            var temp = [];
            var length = $scope.allCalculationsData.length;
            var ave = 0;

            angular.forEach($scope.allCalculationsData, function(value, key)
            {
                if(count == 0)
                {
                    temp.push(getName(currentID));
                }

                if(value[0] != currentID)
                {
                    ave = specificTotal/$scope.totalCost;
                    ave = ave.toFixed(2);
                    percent = ave*100.0;
                    temp.push(percent);

                    $scope.allCostDataPI.push(temp);
                    temp = [];

                    currentID = value[0];
                    console.log(getName(currentID));
                    temp.push(getName(currentID));
                    specificTotal = 0.0;
                }

                specificTotal += parseFloat(value[1]);
                count++;
                if(count == length)
                {
                    ave = specificTotal/$scope.totalCost;
                    ave = ave.toFixed(2);
                    percent = ave*100.0;
                    temp.push(percent);
                    $scope.allCostDataPI.push(temp);
                }
            }, log);
        }

        function populateOverviewTable()
        {
            var log = [];
            var biggest = 0;
            var smallest = 99999;
            var name = "";
            angular.forEach($scope.allCurrentDataPI, function(value, key)
            {
                if(value[1] > biggest)
                {
                    name = value[0];
                    biggest = value[1];
                }
            }, log);

            biggest = ((biggest/100)*$scope.totalCurrent);
            $scope.highest_current = name + " - " + biggest.toFixed(2);
            biggest = 0;

            angular.forEach($scope.allPowerDataPI, function(value, key)
            {
                if(value[1] > biggest)
                {
                    name = value[0];
                    biggest = value[1];
                }
            }, log);

            biggest = ((biggest/100)*$scope.totalPower);
            $scope.highest_power = name + " - " + biggest.toFixed(2);
            biggest = 0;

            angular.forEach($scope.allCostDataPI, function(value, key)
            {
                if(value[2] > biggest)
                {
                    name = value[0];
                    biggest = value[1];
                }
            }, log);

            biggest = ((biggest/100)*$scope.totalCost);
            $scope.highest_cost = name + " - R" + biggest.toFixed(2);

            angular.forEach($scope.allCurrentDataPI, function(value, key)
            {
                if(value[1] < smallest)
                {
                    name = value[0];
                    smallest = value[1];
                }
            }, log);

            smallest = ((smallest/100)*$scope.totalCurrent);
            $scope.lowest_current = name + " - " + smallest.toFixed(2);
            smallest = 999999;

            angular.forEach($scope.allPowerDataPI, function(value, key)
            {
                if(value[1] < smallest)
                {
                    name = value[0];
                    smallest = value[1];
                }
            }, log);

            smallest = ((smallest/100)*$scope.totalPower);
            $scope.lowest_power = name + " - " + smallest.toFixed(2);
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

        function getName(id)
        {
            var log = [];
            var found;
            angular.forEach($scope.deviceMeta, function(value, key)
            {
                if(id == value[0])
                    found = value[1];
            }, log);
            return found;
        }

        $scope.genReport = function()
        {
            $scope.totalCurrent = 0;
            $scope.totalPower = 0;
            $scope.totalCost = 0;

            $scope.allCurrentDataPI = [];
            $scope.allCurrentData = [];

            $scope.allPowerDataPI = [];
            $scope.allPowerData = [];

            $scope.allCalculationsData = [];

            $scope.allCostData = [];
            $scope.allCostDataPI = [];

            $scope.allEmissionData = [];
            $scope.allEmissionDataPI = [];


            fetchAllData();

            $scope.overviewCurrentPIConfig.series = [{ //Works
                "name": 'Devices',
                "colorByPoint": true,
                "data": $scope.allCurrentDataPI
            }];

            $scope.overviewPowerPIConfig.series = [{ //Works
                "name": 'Devices',
                "colorByPoint": true,
                "data": $scope.allPowerDataPI
            }];

            $scope.overviewCostPIConfig.series = [{ //Works
                "name": 'Devices',
                "colorByPoint": true,
                "data": $scope.allCostDataPI
            }];

            $scope.dateSelected = true;
        }
    });

    angular.module('powerCloud')
        .factory('CurrentPI', function ()
        {
                var overviewCurrentPIConfig =
                {
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
                series: [{}],

                loading : true
            };
            return overviewCurrentPIConfig;
        });

    angular.module('powerCloud')
    .factory('PowerPI', function ()
    {
        var overviewPowerPIConfig = {
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
                series: [{}],
                loading : true
            };
            return overviewPowerPIConfig;
    });

angular.module('powerCloud')
    .factory('CostPI', function ()
    {
        var overviewCostPIConfig = {
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
            series: [{}],
            loading : true
        };
        return overviewCostPIConfig;
    });
