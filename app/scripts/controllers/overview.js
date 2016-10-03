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
    .controller('OverviewCtrl', function($scope, $state, ngProgressFactory, CurrentPI, PowerPI) {

        $scope.overviewCurrentPIConfig = CurrentPI;
        $scope.overviewPowerPIConfig = PowerPI;
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

        $scope.totalEmission = 0;
        $scope.totalCost = 0;

        $scope.deviceMeta = [];
        $scope.dateSelected = false;

        $scope.choice = "null";
        $scope.single = "single";
        $scope.multi = "multi";
        $scope.multiDate = false;
        $scope.singleDate = false;

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

        $scope.total_cost = "";
        $scope.total_current = "";
        $scope.total_power = "";
        $scope.total_emissions = "";

        function fetchAllData()
        {
            var referenceLink = "/";
            var data = firebase.database().ref(referenceLink);

            var begin = new Date();
            var end = new Date();
            var beginHolder = new Date();
            var endHolder = new Date();
            if($scope.singleDate == true)
            {
                begin = $scope.dateStringBegin;
                end = begin;
            }
            else
            {
                begin = $scope.dateStringBegin;
                end = $scope.dateStringEnd;
            }


            data.once('value').then(function(snapshot)
            {
                var temp = snapshot.child("device_data");
                temp.forEach(function (d)
                {
                    var check = 0;
                    var id = d.key;
                    console.log("ID - " + id);
                    var count = 0;
                    while(($scope.multiDate == true && begin <= end) || ($scope.singleDate == true && check < 1))
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
                            calculations.push(obj.calculations.emission);

                            $scope.allCalculationsData.push(calculations);
                            $scope.allCurrentData.push(curr);
                            $scope.allPowerData.push(pow);
                        });
                        begin.setDate(begin.getDate() + 1);
                        count++;
                        check++;
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

                populateCurrentPi();
                populatePowerPi();
                populateCostData();
                populateEmissionData();
                populateOverviewTable();

                $scope.overviewCurrentPIConfig.loading = false;
                $scope.overviewPowerPIConfig.loading = false;
                $scope.progressbar.complete();
                $scope.$apply();
            });
        }

        function populateCurrentPi()
        {
            var id;
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
                    percent = ave*100;
                    temp.push(percent);

                    $scope.allCurrentDataPI.push(temp);
                    temp = [];

                    currentID = value[0];
                    temp.push(getName(currentID));
                    specificTotal = 0.0;
                }

                specificTotal += parseFloat(value[2]);
                count++;
                if(count == length)
                {
                    ave = specificTotal/$scope.totalCurrent;
                    ave = ave.toFixed(4);
                    percent = ave*100;
                    temp.push(percent);
                    $scope.allCurrentDataPI.push(temp);
                }
            }, log);
        }

        function populatePowerPi()
        {
            var id;
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
                    ave = ave.toFixed(4);
                    percent = ave*100;
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
                    ave = ave.toFixed(4);
                    percent = ave*100;
                    temp.push(percent);
                    $scope.allPowerDataPI.push(temp);
                }
            }, log);
        }

        function populateCostData()
        {
            var id;
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
                    console.log(getName(currentID));
                    temp.push(getName(currentID));
                }

                if(value[0] != currentID)
                {
                    ave = specificTotal/$scope.totalCost;
                    ave = ave.toFixed(4);
                    percent = ave*100;
                    temp.push(percent);

                    $scope.allCostDataPI.push(temp);
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
                    ave = specificTotal/$scope.totalCost;
                    ave = ave.toFixed(4);
                    percent = ave*100;
                    temp.push(percent);
                    $scope.allCostDataPI.push(temp);
                }
            }, log);
        }

        function populateEmissionData()
        {
            var id;
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
                $scope.totalEmission += parseFloat(value[1]);
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
                    console.log(getName(currentID));
                    temp.push(getName(currentID));
                }

                if(value[0] != currentID)
                {
                    ave = specificTotal/$scope.totalEmission;
                    ave = ave.toFixed(4);
                    percent = ave*100;
                    temp.push(percent);

                    $scope.allEmissionDataPI.push(temp);
                    temp = [];

                    currentID = value[0];
                    temp.push(getName(currentID));
                    specificTotal = 0.0;
                }

                specificTotal += parseFloat(value[2]);
                count++;
                if(count == length)
                {
                    ave = specificTotal/$scope.totalEmission;
                    ave = ave.toFixed(4);
                    percent = ave*100;
                    temp.push(percent);
                    $scope.allEmissionDataPI.push(temp);
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

            console.log(" $scope.allCostDataPI.length " +  $scope.allCostDataPI.length);
            console.log("totalCost " + $scope.totalCost);
            angular.forEach($scope.allCostDataPI, function(value, key)
            {
                console.log("***********************************");
                console.log("name " + value[0] + "\nValue " + value[1]);
                console.log("***********************************");
                if(value[1] > biggest)
                {
                    name = value[0];
                    biggest = value[1];
                }
            }, log);

            biggest = ((biggest/100)*$scope.totalCost);
            $scope.highest_cost = name + " - R" + biggest.toFixed(2);
            biggest = 0;

            angular.forEach($scope.allEmissionDataPI, function(value, key)
            {
                if(value[1] > biggest)
                {
                    name = value[0];
                    biggest = value[1];
                }
            }, log);

            biggest = ((biggest/100)*$scope.totalEmission);
            $scope.highest_emissions = name + " - " + biggest.toFixed(2);

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
            smallest = 999999;

            angular.forEach($scope.allCostDataPI, function(value, key)
            {
                console.log("***********************************");
                console.log("name " + value[0] + "\nValue " + value[1]);
                console.log("***********************************");
                if(value[1] < smallest)
                {
                    name = value[0];
                    smallest = value[1];
                }
            }, log);

            smallest = ((smallest/100)*$scope.totalCost);
            $scope.lowest_cost = name + " - R" + smallest.toFixed(2);
            smallest = 999999;

            angular.forEach($scope.allEmissionDataPI, function(value, key)
            {
                if(value[1] < smallest)
                {
                    name = value[0];
                    smallest = value[1];
                }
            }, log);

            smallest = ((smallest/100)*$scope.totalEmission);
            $scope.lowest_emissions = name + " - " + smallest.toFixed(2);

            $scope.total_cost = "R" + $scope.totalCost.toFixed(2);
            $scope.total_current = "" + $scope.totalCurrent.toFixed(2);
            $scope.total_power = "" + $scope.totalPower.toFixed(2);
            $scope.total_emissions = "" + $scope.totalEmission.toFixed(2);
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
            var found = "";
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

            $scope.dateSelected = true;
        }

        $scope.select = function()
        {
            $scope.singleDate = false;
            $scope.multiDate = false;
            console.log("----------> " + $scope.choice);

            if($scope.choice == "single")
                $scope.singleDate = true;
            else
                $scope.multiDate = true;

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
