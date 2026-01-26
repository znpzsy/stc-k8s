(function () {

    'use strict';

    angular.module('adminportal.services.mca.advertisement', [
        'adminportal.services.mca.advertisement.advertisement'
    ]);

    var MCAAdvertisementModule = angular.module('adminportal.services.mca.advertisement');

    MCAAdvertisementModule.config(function ($stateProvider) {

        $stateProvider.state('services.mca.advertisement', {
            abstract: true,
            url: "",
            templateUrl: "services/mca/advertisement/operations.html"
        });

    });

    MCAAdvertisementModule.controller('MCAAdvertisementLanguagesCtrl', function ($scope, $log, $state, $stateParams, languages) {
        $log.debug("MCAAdvertisementLanguagesCtrl");

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
