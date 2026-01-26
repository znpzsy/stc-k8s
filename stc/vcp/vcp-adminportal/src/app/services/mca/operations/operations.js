(function () {

    'use strict';

    angular.module('adminportal.services.mca.operations', [
        'adminportal.services.mca.operations.subscriptions'
    ]);

    var MCAOperationsModule = angular.module('adminportal.services.mca.operations');

    MCAOperationsModule.config(function ($stateProvider) {

        $stateProvider.state('services.mca.operations', {
            abstract: true,
            url: "/operations",
            templateUrl: "services/mca/operations/operations.html"
        });

    });

    MCAOperationsModule.controller('MCAOperationsLanguagesCtrl', function ($scope, $log, $state, $stateParams, languages) {
        $log.debug("MCAOperationsLanguagesCtrl");

        // Language list
        $scope.languageList = languages;

        if ($stateParams.languageCode) {
            $scope.languageCode = $stateParams.languageCode;
        }

        $scope.changeLanguage = function (languageCode) {
            $log.debug("Selected language: ", languageCode);

            $state.transitionTo($state.$current,
                {
                    messageCode: $stateParams.messageCode ? $stateParams.messageCode : undefined,
                    languageCode: languageCode ? languageCode : undefined
                },
                {
                    reload: false,
                    inherit: false,
                    notify: true
                }
            );
        };
    });

})();
