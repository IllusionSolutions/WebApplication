describe('LoginCtrl', function() {
    beforeEach(module('powerCloud'));

    var $controller;

    beforeEach(inject(function(_$controller_) {
        $controller = _$controller_;
    }));

    describe('$scope.submit', function() {
        it('checks if login succeeds based on correct credentials', function() {


            var $scope = {};
            var controller = $controller('LoginCtrl', { $scope: $scope });
            /*
                $scope.user.email = '';
                $scope.user.password = '';
                $scope.submit();

                expect($scope.strength).toEqual('strong');
            */

        });
    });
});
