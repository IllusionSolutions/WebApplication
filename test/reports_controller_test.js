describe('ReportsCtrl', function() {
    beforeEach(module('powerCloud'));

    var $controller;

    beforeEach(inject(function(_$controller_) {
        $controller = _$controller_;
    }));

    it('Fetches device data.', function() {
        var $scope = {
            deviceID: '' //<-- Insert Particle photon ID for testing
        };

        var controller = $controller('ReportsCtrl', { $scope: $scope });
        $scope.fetchData();

        expect($scope.tempCurrentData).toEqual([]);
        expect($scope.tempPowerData).toEqual([]);
        expect($scope.tempCostData).toEqual([]);
        expect($scope.tempEmissionData).toEqual([]);

    });

    it('Switching the device on and off should succeed', function() {

        var $scope = {
            authToken: sharedProperties.getParticleToken()
        };

        var controller = $controller('ReportsCtrl', { $scope: $scope});
        $scope.toggleDevicePower();

        expect($scope.relayStatus).toEqual(true);
    });


    it('Flashing firmware should succeed.', function() {

        var $scope = {
            authToken: sharedProperties.getParticleToken(),
            file: $scope.file //remember to assign the file when testing
        };

        var controller = $controller('ReportsCtrl', { $scope: $scope});
        $scope.flashFirmware();

        expect($scope.firmwareFileFlashed).toEqual(true);
    });

    it('Flashing firmware should succeed.', function() {

        var $scope = {
            authToken: sharedProperties.getParticleToken(),
            file: $scope.file //remember to assign the file when testing
        };

        var controller = $controller('ReportsCtrl', { $scope: $scope});
        $scope.flashFirmware();

        expect($scope.firmwareFileFlashed).toEqual(true);
    });

    it('Disabling the device should yield true.', function() {

        var $scope = {
            authToken: sharedProperties.getParticleToken()
        };

        var controller = $controller('ReportsCtrl', { $scope: $scope});
        $scope.toggleDevice();

        expect($scope.toggleResult).toEqual(true);
    });

    it('Updating the email to which to receive notifications should yield true.', function() {

        var $scope = {
            authToken: sharedProperties.getParticleToken(),
        };

        var controller = $controller('ReportsCtrl', { $scope: $scope});
        $scope.updateNotificationEmail();

        expect($scope.emailChangeResult).toEqual(true);
    });


    it('Updating polling interval should yield true.', function() {

        var $scope = {
            authToken: sharedProperties.getParticleToken(),
        };

        var controller = $controller('ReportsCtrl', { $scope: $scope});
        $scope.setInterval();

        expect($scope.changeIntervalResult).toEqual(true);
    });

    it('Updating the threshold for current trips should yield true.', function() {

        var $scope = {
            authToken: sharedProperties.getParticleToken(),
        };

        var controller = $controller('ReportsCtrl', { $scope: $scope});
        $scope.setThreshold();

        expect($scope.currentThresholdChangeResult).toEqual(true);
    });
});
