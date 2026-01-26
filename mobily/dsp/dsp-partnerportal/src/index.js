(function () {
    'use strict';

    angular.module('partnerportal.landing', [
        'partnerportal.config'
    ]);

    var PartnerPortalLandingApplicationModule = angular.module('partnerportal.landing');

    PartnerPortalLandingApplicationModule.run(function ($rootScope, $window) {
        $rootScope.redirect = function (path) {
            $window.location.href = path;
        };
    });

    PartnerPortalLandingApplicationModule.controller('PartnerPortalLandingMainController', function ($scope, $timeout) {

        $timeout(function () {
            $scope.redirect('app.html');
        }, 0);

    });

})();
