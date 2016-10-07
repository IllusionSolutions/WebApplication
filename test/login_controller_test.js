describe('LoginCtrl', function() {
    beforeEach(module('powerCloud'));

    var $controller;

    beforeEach(inject(function(_$controller_) {
        $controller = _$controller_;
    }));

    describe('$scope.submit', function()
    {
        it('Checks if login succeeds based on correct credentials.', function() {
            var $scope = {
                user: {}
            };

            var controller = $controller('LoginCtrl', { $scope: $scope });

            $scope.user.email = 'stuart.andrews123@gmail.com';
            $scope.user.password = 'Password1';
            $scope.submit();

            expect($scope.errorVal).toEqual(false);
        });

        it('Login fails based on incorrect credentials.', function() {
            var $scope = {
                user: {
                    email : 'wrongInformation@gmail.com',
                    password : 'WrongPassword'
                },
                errorVal: false
            };

            var controller = $controller('LoginCtrl', { $scope: $scope});
            $scope.submit();

            expect($scope.errorVal).toEqual(false);
        });
    });
});
