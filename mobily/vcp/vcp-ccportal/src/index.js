(function () {
    'use strict';

    angular.module('ccportal.landing', [
        'ccportal.config'
    ]);

    var CCPortalLandingApplicationModule = angular.module('ccportal.landing');

    CCPortalLandingApplicationModule.run(function ($rootScope, $window) {
        $rootScope.redirect = function (path) {
            $window.location.href = path;
        };
    });

    CCPortalLandingApplicationModule.controller('CCPortalLandingMainController', function ($scope, $timeout) {

        $timeout(function () {
            $scope.redirect('app.html');
        }, 0);

    });

})();
