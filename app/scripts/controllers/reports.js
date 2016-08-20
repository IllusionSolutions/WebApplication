
angular.module('yapp')
    .controller('ReportsCtrl', function($scope, $state) {
        $scope.$state = $state;
        var device = $scope.selectedDevice;
        console.log(device.key + " " + device.meta.name);

        $scope.fetchData = function(deviceID){

            /*
             var dateSelected = {};
             dateSelected.year = "2016";
             dateSelected.month = "7";
             dateSelected.day = "18";
             var deviceSelected = deviceID + 1;

             var referenceLink = deviceSelected +"/data/"+ dateSelected.year + "/" + dateSelected.month + "/" + dateSelected.day;
             var data = firebase.database().ref(referenceLink);

             data.once('value').then(function(snapshot)
             {
             snapshot.forEach(function(d){
             $scope.selectedDeviceData.push(d.val());
             });
             $scope.$apply();
             });
             */

        };

    });
