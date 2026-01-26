(function () {
    'use strict';

    angular.module('adminportal.landing', [
        'adminportal.config'
    ]);

    var AdmPortalLandingApplicationModule = angular.module('adminportal.landing');

    AdmPortalLandingApplicationModule.run(function ($rootScope, $window) {
        $rootScope.redirect = function (path) {
            $window.location.href = path;
        };
    });

    AdmPortalLandingApplicationModule.controller('AdmPortalLandingMainController', function ($scope, $timeout) {

        $timeout(function () {
            $scope.redirect('app.html');
        }, 0);

    });
})();
