describe('ProfileCtrl', function() {
    beforeEach(module('powerCloud'));

    var $controller;

    beforeEach(inject(function(_$controller_) {
        $controller = _$controller_;
    }));

    it('Tests successful login to Particle', function() {
        var $scope = {
                        particleEmail: 'mothusi.masibi@gmail.com',
                        particlePass: '' //<-- Replace during testing
        };

        var controller = $controller('ProfileCtrl', { $scope: $scope });
        $scope.loginParticle();

        expect($scope.particleLoginSuccess).toEqual(true);
    });

    it('Tests successful removal of Particle token', function() {
        var $scope = {
            particleEmail: 'mothusi.masibi@gmail.com',
            particlePass: '' //<-- Replace during testing
        };

        var controller = $controller('ProfileCtrl', { $scope: $scope});
        $scope.removeToken();

        expect($scope.tokenTestResult).toEqual(false);
    });

    it('Tests Firebase user authentication', function() {
        var user = {
            email: 'mothusi.masibi@gmail.com',
            pass: ''  //<-- Replace during testing
        };

        var $scope = {
            user: user
        };

        var controller = $controller('ProfileCtrl', { $scope: $scope });
        $scope.re_authenticate();

        expect($scope.authenticated).toEqual(true);
    });
});

