describe('OverviewCtrl', function() {
    beforeEach(module('powerCloud'));

    var $controller;

    beforeEach(inject(function(_$controller_) {
        $controller = _$controller_;
    }));

    it('Ensures select date method retrieves one date.', function() {
        var $scope = {
            choice: 'single'
        };

        var controller = $controller('OverviewCtrl', { $scope: $scope });
        $scope.select();

        expect($scope.singleDate).toEqual(true);
        expect($scope.multiDate).toEqual(false);
    });

    it('Ensures select date method retrieves multiple dates.', function() {
        var $scope = {
            choice: 'double'
        };

        var controller = $controller('OverviewCtrl', { $scope: $scope});
        $scope.select();

        expect($scope.singleDate).toEqual(false);
        expect($scope.multiDate).toEqual(true);
    });
});
