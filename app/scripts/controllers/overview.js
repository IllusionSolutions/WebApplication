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
    .controller('OverviewCtrl', function($scope, $state, ngProgressFactory, CurrentPI, PowerPI, PowerBar, CurrentBar) {

        $scope.overviewCurrentPIConfig = CurrentPI;
        $scope.overviewPowerPIConfig = PowerPI;
        $scope.overviewPowerBarConfig = PowerBar;
        $scope.overviewCurrentBarConfig = CurrentBar;
        $scope.$state = $state;

        $scope.dateStringBegin = new Date();
        $scope.dateStringEnd = new Date();

        $scope.progressbar = ngProgressFactory.createInstance();
        $scope.progressbar.setColor('#ffe11c');
        $scope.progressbar.height = '3px';

        $scope.devicesPower = [];
        $scope.devicesCurrent = [];

        $scope.allCurrentData = [];
        $scope.allCurrentDataPI = [];
        $scope.allCurrentDataBar = [];

        $scope.allPowerData = [];
        $scope.allPowerDataPI = [];
        $scope.allPowerDataBar = [];

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

        $scope.test;

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
                populatePowerBarData();
                populateCurrentBarData();

                console.log(JSON.stringify($scope.allPowerDataBar,null,2));
                console.log(JSON.stringify($scope.allCurrentDataBar,null,2));

                $scope.overviewCurrentPIConfig.loading = false;
                $scope.overviewPowerPIConfig.loading = false;
                $scope.overviewPowerBarConfig.loading = false;
                $scope.overviewCurrentBarConfig.loading = false;
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

            angular.forEach($scope.allCostDataPI, function(value, key)
            {
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

        function populatePowerBarData()
        {
            var id;
            var log = [];
            var devices = [];
            var count = 0;


            angular.forEach($scope.allPowerData, function(value, key)
            {
                id = value[0];
                if(!contains($scope.devicesPower,getName(id)))
                {
                    $scope.devicesPower.push(getName(id));
                }
            }, log);

            console.log($scope.devicesPower);

            var tempDeviceMax = "{\"name\": \"Max\",\"data\":[]}";
            var tempDeviceAvg = "{\"name\": \"Average\",\"data\":[]}";
            var tempDeviceMin = "{\"name\": \"Min\",\"data\":[]}";

            tempDeviceMax = JSON.parse(tempDeviceMax);
            tempDeviceAvg = JSON.parse(tempDeviceAvg);
            tempDeviceMin = JSON.parse(tempDeviceMin);

            var tempName = "";
            var tempData = [];
            var length = $scope.allPowerData.length;

            var current = $scope.devicesPower[0];

            var specificTotal = 0;
            var percent = 0.0;
            var max = [];
            var min = [];
            var avg = [];
            var min = 999999;
            var max = 0;
            var ave = 0;

            var maxed = false;
            var minned = false;
            var avgCount = 0;

            angular.forEach($scope.allPowerData, function(value, key)
            {
                if(getName(value[0]) != current)
                {
                    ave = specificTotal/avgCount;
                    ave = ave.toFixed(2);
                    ave = parseFloat(ave);

                    tempDeviceAvg.data.push(ave);
                    tempDeviceMax.data.push(max);
                    tempDeviceMin.data.push(min);

                    $scope.allPowerDataBar.push(tempDeviceAvg);
                    $scope.allPowerDataBar.push(tempDeviceMax);
                    $scope.allPowerDataBar.push(tempDeviceMin);

                    avgCount = 0;
                    current = getName(value[0]);
                    specificTotal = 0;
                    min = 999999;
                    max = 0;
                }

                if(value[2] > max)
                {
                    max = parseFloat(value[2]);
                }

                if(value[2] < min)
                {
                    min = parseFloat(value[2]);
                }

                specificTotal += parseFloat(value[2]);
                count++;
                avgCount++;

                if(count == length)
                {
                    console.log(avgCount);
                    ave = specificTotal/avgCount;
                    ave = ave.toFixed(2);
                    ave = parseFloat(ave);

                    tempDeviceAvg.data.push(ave);
                    tempDeviceMax.data.push(max);
                    tempDeviceMin.data.push(min);

                    $scope.allPowerDataBar.push(tempDeviceAvg);
                    $scope.allPowerDataBar.push(tempDeviceMax);
                    $scope.allPowerDataBar.push(tempDeviceMin);
                }
            }, log);
        }

        function populateCurrentBarData()
        {
            var id;
            var log = [];
            var devices = [];
            var count = 0;


            angular.forEach($scope.allCurrentData, function(value, key)
            {
                id = value[0];
                if(!contains($scope.devicesCurrent,getName(id)))
                {
                    $scope.devicesCurrent.push(getName(id));
                }
            }, log);


            var tempDeviceMax = "{\"name\": \"Max\",\"data\":[]}";
            var tempDeviceAvg = "{\"name\": \"Average\",\"data\":[]}";
            var tempDeviceMin = "{\"name\": \"Min\",\"data\":[]}";

            tempDeviceMax = JSON.parse(tempDeviceMax);
            tempDeviceAvg = JSON.parse(tempDeviceAvg);
            tempDeviceMin = JSON.parse(tempDeviceMin);

            var tempName = "";
            var tempData = [];
            var length = $scope.allCurrentData.length;

            var current = $scope.devicesCurrent[0];

            var specificTotal = 0;
            var percent = 0.0;
            var max = [];
            var min = [];
            var avg = [];
            var min = 999999;
            var max = 0;
            var ave = 0;

            var maxed = false;
            var minned = false;
            var avgCount = 0;

            angular.forEach($scope.allCurrentData, function(value, key)
            {
                if(getName(value[0]) != current)
                {
                    ave = specificTotal/avgCount;
                    ave = ave.toFixed(2);
                    ave = parseFloat(ave);

                    tempDeviceAvg.data.push(ave);
                    tempDeviceMax.data.push(max);
                    tempDeviceMin.data.push(min);

                    $scope.allCurrentDataBar.push(tempDeviceAvg);
                    $scope.allCurrentDataBar.push(tempDeviceMax);
                    $scope.allCurrentDataBar.push(tempDeviceMin);

                    current = getName(value[0]);
                    specificTotal = 0;
                    min = 999999;
                    max = 0;
                }

                if(value[2] > max)
                {
                    max = parseFloat(value[2]);
                }

                if(value[2] < min)
                {
                    min = parseFloat(value[2]);
                }

                specificTotal += parseFloat(value[2]);
                count++;
                avgCount++;

                if(count == length)
                {
                    ave = specificTotal/avgCount;
                    ave = ave.toFixed(2);
                    ave = parseFloat(ave);

                    tempDeviceAvg.data.push(ave);
                    tempDeviceMax.data.push(max);
                    tempDeviceMin.data.push(min);

                    $scope.allCurrentDataBar.push(tempDeviceAvg);
                    $scope.allCurrentDataBar.push(tempDeviceMax);
                    $scope.allCurrentDataBar.push(tempDeviceMin);
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
            $scope.allCurrentDataBar = [];

            $scope.allPowerDataPI = [];
            $scope.allPowerDataBar = [];
            $scope.allPowerData = [];

            $scope.devicesPower = [];
            $scope.devicesCurrent = [];

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

            var month1 = $scope.dateStringBegin.getMonth()+1;
            var month2 = $scope.dateStringEnd.getMonth()+1;

            $scope.overviewPowerBarConfig.xAxis.categories = $scope.devicesPower;

            if($scope.singleDate == true) {
                $scope.overviewPowerBarConfig.subtitle.text = 'On ' + $scope.dateStringBegin.getDate() + '/' + month1 + '/' + $scope.dateStringBegin.getFullYear();
            }
            else if($scope.multiDate == true) {
                $scope.overviewPowerBarConfig.subtitle.text = 'From the ' + $scope.dateStringBegin.getDate() + '/' + month1 + '/' + $scope.dateStringBegin.getFullYear() + ' to the ' + $scope.dateStringEnd.getDate() + '/' + month2 + '/' + $scope.dateStringEnd.getFullYear();
            }
            $scope.overviewPowerBarConfig.series = $scope.allPowerDataBar;

            $scope.overviewCurrentBarConfig.xAxis.categories = $scope.devicesCurrent;
            if($scope.singleDate == true)
            {
                $scope.overviewCurrentBarConfig.subtitle.text = 'On ' + $scope.dateStringBegin.getDate() + '/' + month1 + '/' + $scope.dateStringBegin.getFullYear();
            }
            else if($scope.multiDate == true)
            {
                $scope.overviewCurrentBarConfig.subtitle.text = 'From the ' + $scope.dateStringBegin.getDate() + '/' + month1 + '/' + $scope.dateStringBegin.getFullYear() + ' to the ' + $scope.dateStringEnd.getDate() + '/' + month2 + '/' + $scope.dateStringEnd.getFullYear();
            }
            $scope.overviewCurrentBarConfig.series = $scope.allCurrentDataBar;
            $scope.overviewCurrentBarConfig.options.chart.renderTo = $scope.test;
            //$scope.overviewPowerLineConfig.series = $scope.allPowerDataBar;
            $scope.dateSelected = true;
        }

        $scope.select = function()
        {
            $scope.singleDate = false;
            $scope.multiDate = false;

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
                            renderTo: 'container',
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
    .factory('PowerBar', function ()
    {
        var overviewPowerBarConfig =
        {
            options: {
                chart: {
                    type: 'bar'
                }
            },
            legend: {
                enabled: true,
                backgroundColor: '#FFFFFF',
                borderWidth: 0,
                itemStyle: {
                    fontFamily: 'Arial',
                    fontSize: '10px'
                },
                align: 'right',
                layout: 'vertical',
                floating: false,
                verticalAlign: 'top',
                y: 35
            },
            title: {
                text: 'Overview of Power Usage'
            },
            subtitle: {
                text: ''
            },
            xAxis: {},
            yAxis: {
                min: 0,
                title: {
                    text: 'Power (kWh)',
                    align: 'high'
                },
            },
            plotOptions: {
                    dataLabels: {
                        enabled: true,
                        align: 'right',
                        color: '#FFFFFF',
                        x: -10
                    },
                    pointPadding: 0.1,
                    groupPadding: 0
            },
            credits: {
                enabled: false
            },
            series: [{}],
            loading:true
        };
        return overviewPowerBarConfig;
    });

angular.module('powerCloud')
    .factory('CurrentBar', function ()
    {
        var overviewCurrentBarConfig =
        {
            options: {
                chart: {
                    type: 'bar'
                }
            },
            legend: {
                enabled: true,
                backgroundColor: '#FFFFFF',
                borderWidth: 0,
                itemStyle: {
                    fontFamily: 'Arial',
                    fontSize: '10px'
                },
                align: 'right',
                layout: 'vertical',
                floating: false,
                verticalAlign: 'top',
                y: 35
            },
            title: {
                text: 'Overview of Current Usage'
            },
            subtitle: {
                text: ''
            },
            xAxis: {},
            yAxis: {
                min: 0,
                title: {
                    text: 'Current (A)',
                    align: 'high'
                },
            },
            plotOptions: {
                    dataLabels: {
                        enabled: true,
                        align: 'right',
                        color: '#FFFFFF',
                        x: -10
                    },
                    pointPadding: 0.1,
                    groupPadding: 0
            },
            credits: {
                enabled: false
            },
            series: [{}],
            loading:true
        };
        return overviewCurrentBarConfig;
    });
