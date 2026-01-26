(function () {

    'use strict';

    angular.module('ccportal.unauthorized', []);

    var UnauthorizedModule = angular.module('ccportal.unauthorized');

    UnauthorizedModule.config(function ($stateProvider) {

        $stateProvider.state('unauthorized', {
            url: "/unauthorized",
            templateUrl: 'login/unauthorized.html',
            controller: 'UnauthorizedCtrl',
            data: {
                headerKey: 'CommonMessages.Unauthorized'
            }
        });

    });

    UnauthorizedModule.controller('UnauthorizedCtrl', function ($scope, $translate) {
        $scope.error_message = $translate.instant('CommonMessages.Unauthorized');
    });

})();
