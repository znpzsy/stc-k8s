(function () {

    'use strict';

    angular.module('adminportal.services.vm.operations', [
        'adminportal.services.vm.operations.classofserviceprofiles',
        'adminportal.services.vm.operations.subscriptions'
    ]);

    var VMOperationsModule = angular.module('adminportal.services.vm.operations');

    VMOperationsModule.config(function ($stateProvider) {

        $stateProvider.state('services.vm.operations', {
            abstract: true,
            url: "/operations",
            templateUrl: "services/vm/operations/operations.html"
        });

    });

    VMOperationsModule.controller('VMOperationsLanguagesCtrl', function ($scope, $log, $state, $stateParams, languages) {
        $log.debug("VMOperationsLanguagesCtrl");

        // Language list
        $scope.languageList = [];
        _.each(languages.shortCodes, function (shortCode) {
            $scope.languageList.push({
                languageCode: shortCode
            });
        });

        if ($stateParams.languageCode) {
            $scope.languageCode = $stateParams.languageCode;
        }

        $scope.changeLanguage = function (languageCode) {
            $log.debug("Selected language: ", languageCode);

            $state.transitionTo($state.$current, {languageCode: languageCode ? languageCode : undefined}, {
                reload: false,
                inherit: false,
                notify: true
            });
        };
    });

})();
